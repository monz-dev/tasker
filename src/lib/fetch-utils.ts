/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Wraps a promise-like value with a timeout. Rejects if it doesn't resolve in time.
 * Accepts Supabase's thenable query builders (not strict Promise<T>).
 */
export function withTimeout<T>(promiseLike: { then: any; catch?: any }, ms = 15000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('La base de datos tardó demasiado en responder. Intente de nuevo.'));
    }, ms);

    Promise.resolve(promiseLike).then(
      (value: T) => { clearTimeout(timer); resolve(value); },
      (err: unknown) => { clearTimeout(timer); reject(err); }
    );
  });
}

/**
 * Retries an async function up to `retries` times with exponential backoff.
 * Returns the result on first success, or throws the last error.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

/**
 * Combines retry + timeout for Supabase calls.
 * Default: 15s timeout, 2 retries with exponential backoff.
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options?: { timeoutMs?: number; retries?: number }
): Promise<T> {
  const { timeoutMs = 15000, retries = 2 } = options ?? {};
  return withRetry(() => withTimeout(fn(), timeoutMs), retries);
}
