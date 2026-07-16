/**
 * Fetch utilities for Supabase queries with real abort-based timeout
 * and retry classification that avoids amplifying non-retryable errors.
 */

/** Error thrown when a query is aborted by timeout. */
export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Result envelope from Supabase queries.
 */
export interface SupabaseResult<T> {
  data: T | null;
  error: SupabaseError | null;
}

/**
 * Minimal shape of a Supabase/PostgREST error.
 */
export interface SupabaseError {
  message: string;
  code?: string;
  status?: number;
  details?: string;
  hint?: string;
}

/**
 * A thenable value — matches Supabase's PromiseLike query builders.
 */
type Thenable<T> = { then: PromiseLike<T>['then'] };

/**
 * HTTP status codes considered retryable (transient server/network issues).
 * Everything else (auth, client errors, RLS) is non-retryable.
 */
const RETRYABLE_HTTP_STATUS = new Set([408, 409, 429, 500, 502, 503, 504]);

/**
 * PostgREST/Supabase error codes that are NEVER retryable.
 * These indicate auth, permission, or client-side problems.
 */
const NON_RETRYABLE_CODES = new Set([
  '42501', // insufficient_privilege (RLS)
  '23505', // unique_violation (not transient)
  '23503', // foreign_key_violation
  '23502', // not_null_violation
  '23514', // check_violation
]);

/**
 * Determines whether an error is retryable based on status codes,
 * error codes, and error message patterns.
 */
export function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as Record<string, unknown>;

  // Network / fetch failures are retryable
  if (err instanceof TypeError && /fetch|network|Failed to fetch/i.test(err.message)) {
    return true;
  }

  // Timeout errors are retryable
  if (err instanceof TimeoutError || err.name === 'TimeoutError' || err.name === 'AbortError') {
    return true;
  }

  // Check Supabase error shape
  const status = typeof err.status === 'number' ? err.status : undefined;
  const code = typeof err.code === 'string' ? err.code : undefined;
  const message = typeof err.message === 'string' ? err.message : '';

  // Explicit non-retryable PostgREST codes
  if (code && NON_RETRYABLE_CODES.has(code)) return false;

  // HTTP 4xx (except 408/409/429) are non-retryable
  if (status !== undefined) {
    if (status >= 400 && status < 500) {
      return RETRYABLE_HTTP_STATUS.has(status);
    }
    // 5xx are retryable
    if (status >= 500) return true;
  }

  // Supabase auth errors — never retry
  if (/auth|JWT|token|session|permission|forbidden|unauthorized/i.test(message)) {
    return false;
  }

  // RLS / permission errors — never retry
  if (/row.level.security|RLS|policy|permission denied/i.test(message)) {
    return false;
  }

  // Default: unknown errors are not retried to avoid amplifying client bugs
  return false;
}

/**
 * Type guard: checks if a value has .abortSignal(signal) method.
 * Supabase PostgrestTransformBuilder and PostgrestFilterBuilder have this.
 * PostgrestBuilder (base class, e.g. from .insert()) does NOT.
 */
function hasAbortSignal(value: unknown): value is { abortSignal: (signal: AbortSignal) => unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'abortSignal' in value &&
    typeof (value as Record<string, unknown>).abortSignal === 'function'
  );
}

/**
 * Wraps a Supabase query with a real AbortController-based timeout.
 *
 * If the query builder supports `.abortSignal(signal)` (available on
 * PostgrestTransformBuilder/PostgrestFilterBuilder), the AbortController
 * signal is applied directly — this cancels the underlying HTTP request
 * and frees browser connection slots.
 *
 * For builders that don't support `.abortSignal()` (e.g. raw PostgrestBuilder
 * from `.insert()`), falls back to Promise.race which still enforces the
 * timeout but doesn't cancel the HTTP request.
 *
 * @param query - A Supabase query builder or any PromiseLike value
 * @param timeoutMs - Timeout in milliseconds (default: 15000)
 * @returns The query result
 * @throws TimeoutError if the query times out
 */
export async function withTimeout<T>(
  query: Thenable<SupabaseResult<T>>,
  timeoutMs = 15000
): Promise<SupabaseResult<T>> {
  if (hasAbortSignal(query)) {
    // Abort path: apply signal for real HTTP cancellation.
    // The AbortController cancels the underlying HTTP request.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const target = query.abortSignal(controller.signal) as Thenable<SupabaseResult<T>>;
      const result = await target;
      clearTimeout(timer);
      return result;
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new TimeoutError('Request timed out');
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new TimeoutError('Request timed out');
      }
      throw err;
    }
  }

  // Fallback path for builders without .abortSignal (e.g. raw PostgrestBuilder).
  // Race the query against a timeout so the promise still rejects on timeout,
  // even though the underlying HTTP request cannot be cancelled.
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError('Request timed out')), timeoutMs);
  });

  try {
    return await Promise.race([query, timeoutPromise]);
  } finally {
    // Clear the timeout timer if the query won the race,
    // preventing the rejected promise from floating.
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

/**
 * Retries an async function only for retryable transient failures.
 *
 * Non-retryable errors (auth, RLS, client 4xx) are thrown immediately.
 * Default maxRetries=1 to avoid double-retry storms with Supabase
 * built-in PostgREST retries.
 *
 * @param fn - Async function to execute
 * @param maxRetries - Maximum retry attempts (default: 1)
 * @param baseDelayMs - Base delay for exponential backoff (default: 1000)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 1,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Don't retry non-retryable errors
      if (!isRetryableError(err)) {
        throw err;
      }

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Options for fetchWithRetry.
 */
export interface FetchOptions {
  /** Timeout in milliseconds (default: 15000) */
  timeoutMs?: number;
  /** Maximum retry attempts (default: 1) */
  retries?: number;
  /** Base delay for exponential backoff in ms (default: 1000) */
  baseDelayMs?: number;
}

/**
 * Combines abort-based timeout + selective retry for Supabase queries.
 *
 * Usage:
 * ```ts
 * const { data, error } = await fetchWithRetry(
 *   () => supabase.from('tasks').select('*').eq('project_id', id)
 * );
 * ```
 *
 * The query builder is passed as a factory function so each retry attempt
 * creates a fresh query (and fresh AbortController).
 *
 * Default: 15s timeout, 1 retry with exponential backoff.
 * Retries both thrown transient errors (network, timeout) AND retryable
 * Supabase error envelopes (HTTP 5xx, 408, 429). Non-retryable envelopes
 * (auth, RLS, client 4xx) are returned immediately for callers to handle.
 */
export async function fetchWithRetry<T = unknown>(
  queryFn: () => Thenable<SupabaseResult<T>>,
  options?: FetchOptions
): Promise<SupabaseResult<T>> {
  const { timeoutMs = 15000, retries = 1, baseDelayMs = 1000 } = options ?? {};

  try {
    return await withRetry(async () => {
      const result = await withTimeout<T>(queryFn(), timeoutMs);

      // If the Supabase envelope contains a retryable error, throw it so
      // withRetry can catch and retry. Non-retryable envelopes are returned
      // as-is for callers to handle via the .error field.
      if (result.error && isRetryableError(result.error)) {
        throw result.error;
      }

      return result;
    }, retries, baseDelayMs);
  } catch (err) {
    // If retries were exhausted on a Supabase envelope error, convert the
    // thrown error back into a SupabaseResult envelope so callers still
    // receive the expected { data, error } shape.
    if (isRetryableError(err)) {
      return { data: null, error: err as SupabaseError };
    }
    throw err;
  }
}

/**
 * Convenience wrapper for Supabase queries that don't need retry
 * (e.g. mutations where idempotency isn't guaranteed).
 *
 * ```ts
 * const { data, error } = await fetchOnce(
 *   () => supabase.from('tasks').insert({ ... }).select().single()
 * );
 * ```
 */
export async function fetchOnce<T = unknown>(
  queryFn: () => Thenable<SupabaseResult<T>>,
  timeoutMs = 15000
): Promise<SupabaseResult<T>> {
  return withTimeout<T>(queryFn(), timeoutMs);
}
