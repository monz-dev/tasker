'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/**
 * Keeps the browser-side supabase client in step with the server-side proxy.
 *
 * On a hard reload the browser sends fresh cookies and the supabase client
 * picks up the latest session. On a soft navigation (Next.js client-side
 * `router.push`) the cookies are unchanged, so if the access token expired
 * the supabase client may use a stale token, causing data fetches to hang
 * or fail silently with no error in the console (the client swallows the
 * 401 / refresh failure in its internal pipeline).
 *
 * Calling `getSession()` on every navigation and on tab focus forces the
 * client to re-validate and refresh tokens before any view fires its
 * queries. This component renders nothing.
 *
 * Deduplication: concurrent `getSession()` calls are coalesced so that
 * rapid focus/visibility/pathname changes never trigger duplicate
 * auth refreshes racing with each other.
 *
 * Deadlock guard: if `getSession()` never settles (e.g. network hang,
 * Supabase client bug), the in-flight flag is forcibly cleared after
 * SESSION_REFRESH_TIMEOUT_MS so future refresh attempts are not
 * permanently blocked.
 */

/** Maximum time (ms) to wait for a single getSession() call before giving up. */
const SESSION_REFRESH_TIMEOUT_MS = 10_000;

export function SessionSync() {
  const pathname = usePathname();
  const refreshInFlight = useRef(false);
  const refreshQueued = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    // If a refresh is already in flight, queue one more and return
    if (refreshInFlight.current) {
      refreshQueued.current = true;
      return;
    }

    refreshInFlight.current = true;

    // Guard: if getSession() hangs, forcibly clear the in-flight flag
    // so future refresh attempts are not permanently blocked.
    clearRefreshTimeout();
    timeoutRef.current = setTimeout(() => {
      if (refreshInFlight.current) {
        refreshInFlight.current = false;
        // Process any queued refresh so it isn't lost
        if (refreshQueued.current) {
          refreshQueued.current = false;
          refreshSession();
        }
      }
    }, SESSION_REFRESH_TIMEOUT_MS);

    try {
      await supabase.auth.getSession();
    } catch {
      // getSession() internally handles errors; swallow here
    } finally {
      clearRefreshTimeout();
      refreshInFlight.current = false;

      // If another refresh was queued while we were running, fire it now
      // to ensure the latest state is captured
      if (refreshQueued.current) {
        refreshQueued.current = false;
        refreshSession();
      }
    }
  }, [clearRefreshTimeout]);

  // Revalidate on pathname change (soft navigation)
  useEffect(() => {
    refreshSession();
  }, [pathname, refreshSession]);

  // Revalidate when tab becomes visible or window gains focus
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    };

    const onFocus = () => {
      refreshSession();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshSession]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      clearRefreshTimeout();
    };
  }, [clearRefreshTimeout]);

  return null;
}
