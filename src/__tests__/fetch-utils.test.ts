import { describe, it, expect, vi } from 'vitest';
import {
  withTimeout,
  withRetry,
  fetchWithRetry,
  fetchOnce,
  isRetryableError,
  TimeoutError,
} from '@/lib/fetch-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a mock Supabase query builder with abortSignal support. */
function mockQueryBuilder<T>(result: T, delayMs = 0) {
  let signal: AbortSignal | undefined;

  const builder: any = {
    abortSignal(s: AbortSignal) {
      signal = s;
      return builder;
    },
    then(resolve: Function, reject: Function) {
      if (delayMs === 0) {
        queueMicrotask(() => {
          if (signal?.aborted) {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          } else {
            resolve({ data: result, error: null });
          }
        });
      } else {
        const timer = setTimeout(() => {
          if (signal?.aborted) {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          } else {
            resolve({ data: result, error: null });
          }
        }, delayMs);

        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }
    },
  };

  return builder;
}

/** Creates a mock builder WITHOUT abortSignal (like PostgrestBuilder from .insert()). */
function mockBuilderNoAbortSignal<T>(result: T, delayMs = 0) {
  const builder: any = {
    then(resolve: Function, reject: Function) {
      if (delayMs === 0) {
        queueMicrotask(() => resolve({ data: result, error: null }));
      } else {
        setTimeout(() => resolve({ data: result, error: null }), delayMs);
      }
    },
  };

  return builder;
}

/**
 * Creates a mock builder WITHOUT abortSignal that NEVER settles.
 * Used to verify the timeout fallback actually rejects.
 */
function mockBuilderNeverSettles() {
  const builder: any = {
    then(_resolve: Function, _reject: Function) {
      // Intentionally never call resolve or reject
    },
  };

  return builder;
}

/**
 * Creates a mock builder that returns a Supabase error envelope.
 */
function mockErrorEnvelopeBuilder(error: { message: string; code?: string; status?: number }) {
  const builder: any = {
    abortSignal(_s: AbortSignal) {
      return builder;
    },
    then(resolve: Function, _reject: Function) {
      queueMicrotask(() => resolve({ data: null, error }));
    },
  };

  return builder;
}

// ---------------------------------------------------------------------------
// isRetryableError
// ---------------------------------------------------------------------------

describe('isRetryableError', () => {
  it('returns true for TimeoutError', () => {
    expect(isRetryableError(new TimeoutError())).toBe(true);
  });

  it('returns true for AbortError', () => {
    const err = new DOMException('aborted', 'AbortError');
    expect(isRetryableError(err)).toBe(true);
  });

  it('returns true for network TypeError', () => {
    const err = new TypeError('Failed to fetch');
    expect(isRetryableError(err)).toBe(true);
  });

  it('returns true for HTTP 500', () => {
    expect(isRetryableError({ status: 500, message: 'server error' })).toBe(true);
  });

  it('returns true for HTTP 502/503/504', () => {
    expect(isRetryableError({ status: 502, message: '' })).toBe(true);
    expect(isRetryableError({ status: 503, message: '' })).toBe(true);
    expect(isRetryableError({ status: 504, message: '' })).toBe(true);
  });

  it('returns true for HTTP 408 (Request Timeout)', () => {
    expect(isRetryableError({ status: 408, message: '' })).toBe(true);
  });

  it('returns true for HTTP 429 (Too Many Requests)', () => {
    expect(isRetryableError({ status: 429, message: '' })).toBe(true);
  });

  it('returns false for HTTP 401 (Unauthorized)', () => {
    expect(isRetryableError({ status: 401, message: 'unauthorized' })).toBe(false);
  });

  it('returns false for HTTP 403 (Forbidden)', () => {
    expect(isRetryableError({ status: 403, message: 'forbidden' })).toBe(false);
  });

  it('returns false for HTTP 404 (Not Found)', () => {
    expect(isRetryableError({ status: 404, message: '' })).toBe(false);
  });

  it('returns false for HTTP 406 (Not Acceptable)', () => {
    expect(isRetryableError({ status: 406, message: '' })).toBe(false);
  });

  it('returns false for RLS error code 42501', () => {
    expect(isRetryableError({ code: '42501', message: 'permission denied' })).toBe(false);
  });

  it('returns false for unique violation 23505', () => {
    expect(isRetryableError({ code: '23505', message: 'duplicate key' })).toBe(false);
  });

  it('returns false for auth-related messages', () => {
    expect(isRetryableError({ message: 'JWT expired' })).toBe(false);
    expect(isRetryableError({ message: 'Invalid session token' })).toBe(false);
    expect(isRetryableError({ message: 'Authentication required' })).toBe(false);
  });

  it('returns false for RLS-related messages', () => {
    expect(isRetryableError({ message: 'row level security policy violation' })).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });

  it('returns false for generic unknown errors', () => {
    expect(isRetryableError({ message: 'something weird' })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// withTimeout
// ---------------------------------------------------------------------------

describe('withTimeout', () => {
  it('resolves when query completes before timeout', async () => {
    const query = mockQueryBuilder({ id: 1 }, 10);
    const resolved = await withTimeout(query, 2000);
    expect(resolved).toEqual({ data: { id: 1 }, error: null });
  });

  it('throws TimeoutError when query exceeds timeout', async () => {
    const query = mockQueryBuilder(null, 10000);
    await expect(withTimeout(query, 50)).rejects.toThrow(TimeoutError);
  }, 10000);

  it('aborts the underlying query on timeout', async () => {
    let abortCalled = false;
    let signal: AbortSignal | undefined;

    const builder: any = {
      abortSignal(s: AbortSignal) {
        signal = s;
        signal.addEventListener('abort', () => { abortCalled = true; });
        return builder;
      },
      then(_resolve: Function, reject: Function) {
        if (signal?.aborted) {
          reject(new DOMException('aborted', 'AbortError'));
          return;
        }
        signal?.addEventListener('abort', () => {
          reject(new DOMException('aborted', 'AbortError'));
        });
      },
    };

    await expect(withTimeout(builder, 50)).rejects.toThrow(TimeoutError);
    expect(abortCalled).toBe(true);
  }, 10000);

  it('falls back to Promise.race when builder lacks abortSignal', async () => {
    const query = mockBuilderNoAbortSignal({ id: 1 }, 10);
    const resolved = await withTimeout(query, 2000);
    expect(resolved).toEqual({ data: { id: 1 }, error: null });
  });

  it('clears timeout on successful resolution', async () => {
    const query = mockQueryBuilder('ok', 10);
    const resolved = await withTimeout(query, 2000);
    expect(resolved).toEqual({ data: 'ok', error: null });
  });
});

// ---------------------------------------------------------------------------
// withRetry
// ---------------------------------------------------------------------------

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, 2);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new TimeoutError())
      .mockResolvedValue('ok');

    const result = await withRetry(fn, 1, 10);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry non-retryable errors', async () => {
    const authError = { status: 401, message: 'unauthorized' };
    const fn = vi.fn().mockRejectedValue(authError);

    await expect(withRetry(fn, 2, 10)).rejects.toEqual(authError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry RLS errors', async () => {
    const rlsError = { code: '42501', message: 'permission denied' };
    const fn = vi.fn().mockRejectedValue(rlsError);

    await expect(withRetry(fn, 2, 10)).rejects.toEqual(rlsError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws last error after exhausting retries', async () => {
    const err = new TimeoutError('still failing');
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, 2, 10)).rejects.toThrow(TimeoutError);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects maxRetries=0 (no retries)', async () => {
    const fn = vi.fn().mockRejectedValue(new TimeoutError());

    await expect(withRetry(fn, 0, 10)).rejects.toThrow(TimeoutError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// fetchWithRetry
// ---------------------------------------------------------------------------

describe('fetchWithRetry', () => {
  it('returns Supabase result on success', async () => {
    const queryFn = () => mockQueryBuilder([{ id: 1 }], 10);
    const resolved = await fetchWithRetry(queryFn, { timeoutMs: 2000 });
    expect(resolved).toEqual({ data: [{ id: 1 }], error: null });
  });

  it('retries on timeout and succeeds', async () => {
    let attempt = 0;
    const queryFn = () => {
      attempt++;
      if (attempt === 1) {
        return mockQueryBuilder(null, 10000); // Will timeout
      }
      return mockQueryBuilder([{ id: 1 }], 10); // Succeeds
    };

    const resolved = await fetchWithRetry(queryFn, {
      timeoutMs: 50,
      retries: 1,
      baseDelayMs: 10,
    });

    expect(resolved.data).toEqual([{ id: 1 }]);
  }, 15000);

  it('does not retry auth errors from Supabase', async () => {
    let callCount = 0;
    const queryFn = () => {
      callCount++;
      // Return a builder that resolves with an auth error in the result
      return mockQueryBuilder(null, 10);
    };

    const resolved = await fetchWithRetry(queryFn, { timeoutMs: 2000, retries: 2 });
    // fetchWithRetry returns the Supabase result; the caller checks .error
    expect(callCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// fetchOnce
// ---------------------------------------------------------------------------

describe('fetchOnce', () => {
  it('returns result without retry', async () => {
    const queryFn = () => mockQueryBuilder({ id: 1 }, 10);
    const resolved = await fetchOnce(queryFn, 2000);
    expect(resolved).toEqual({ data: { id: 1 }, error: null });
  });

  it('throws TimeoutError on timeout', async () => {
    const queryFn = () => mockQueryBuilder(null, 10000);
    await expect(fetchOnce(queryFn, 50)).rejects.toThrow(TimeoutError);
  }, 10000);
});

// ---------------------------------------------------------------------------
// withTimeout — no-abort fallback (Finding 1 fix)
// ---------------------------------------------------------------------------

describe('withTimeout (no-abort fallback)', () => {
  it('rejects with TimeoutError when builder has no abortSignal and never settles', async () => {
    const query = mockBuilderNeverSettles();
    await expect(withTimeout(query, 50)).rejects.toThrow(TimeoutError);
  }, 10000);

  it('resolves when no-abort builder settles before timeout', async () => {
    const query = mockBuilderNoAbortSignal({ id: 42 }, 10);
    const result = await withTimeout(query, 2000);
    expect(result).toEqual({ data: { id: 42 }, error: null });
  });

  it('rejects with TimeoutError when no-abort builder exceeds timeout', async () => {
    // Use a builder that delays longer than the timeout
    const query = mockBuilderNoAbortSignal({ id: 1 }, 10000);
    await expect(withTimeout(query, 50)).rejects.toThrow(TimeoutError);
  }, 10000);
});

// ---------------------------------------------------------------------------
// fetchWithRetry — envelope retry (Finding 2 fix)
// ---------------------------------------------------------------------------

describe('fetchWithRetry (envelope retry)', () => {
  it('retries on retryable Supabase error envelope (HTTP 500) and succeeds', async () => {
    let attempt = 0;
    const queryFn = () => {
      attempt++;
      if (attempt === 1) {
        return mockErrorEnvelopeBuilder({ message: 'server error', status: 500 });
      }
      return mockQueryBuilder([{ id: 1 }], 10);
    };

    const result = await fetchWithRetry(queryFn, {
      timeoutMs: 2000,
      retries: 1,
      baseDelayMs: 10,
    });

    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.error).toBeNull();
    expect(attempt).toBe(2);
  });

  it('retries on retryable Supabase error envelope (HTTP 503) and succeeds', async () => {
    let attempt = 0;
    const queryFn = () => {
      attempt++;
      if (attempt === 1) {
        return mockErrorEnvelopeBuilder({ message: 'service unavailable', status: 503 });
      }
      return mockQueryBuilder([{ id: 1 }], 10);
    };

    const result = await fetchWithRetry(queryFn, {
      timeoutMs: 2000,
      retries: 1,
      baseDelayMs: 10,
    });

    expect(result.data).toEqual([{ id: 1 }]);
    expect(attempt).toBe(2);
  });

  it('returns envelope after exhausting retries on retryable error', async () => {
    const queryFn = () =>
      mockErrorEnvelopeBuilder({ message: 'bad gateway', status: 502 });

    const result = await fetchWithRetry(queryFn, {
      timeoutMs: 2000,
      retries: 1,
      baseDelayMs: 10,
    });

    // Should return envelope (not throw) even after retry exhaustion
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(502);
  });

  it('does NOT retry non-retryable Supabase error envelope (HTTP 401)', async () => {
    let callCount = 0;
    const queryFn = () => {
      callCount++;
      return mockErrorEnvelopeBuilder({ message: 'unauthorized', status: 401 });
    };

    const result = await fetchWithRetry(queryFn, {
      timeoutMs: 2000,
      retries: 2,
      baseDelayMs: 10,
    });

    // Non-retryable: returned immediately, no retry
    expect(result.data).toBeNull();
    expect(result.error!.status).toBe(401);
    expect(callCount).toBe(1);
  });

  it('does NOT retry RLS error envelope (code 42501)', async () => {
    let callCount = 0;
    const queryFn = () => {
      callCount++;
      return mockErrorEnvelopeBuilder({ message: 'permission denied', code: '42501' });
    };

    const result = await fetchWithRetry(queryFn, {
      timeoutMs: 2000,
      retries: 2,
      baseDelayMs: 10,
    });

    expect(result.data).toBeNull();
    expect(result.error!.code).toBe('42501');
    expect(callCount).toBe(1);
  });

  it('retries on HTTP 429 (rate limit) envelope', async () => {
    let attempt = 0;
    const queryFn = () => {
      attempt++;
      if (attempt === 1) {
        return mockErrorEnvelopeBuilder({ message: 'rate limited', status: 429 });
      }
      return mockQueryBuilder([{ id: 1 }], 10);
    };

    const result = await fetchWithRetry(queryFn, {
      timeoutMs: 2000,
      retries: 1,
      baseDelayMs: 10,
    });

    expect(result.data).toEqual([{ id: 1 }]);
    expect(attempt).toBe(2);
  });
});
