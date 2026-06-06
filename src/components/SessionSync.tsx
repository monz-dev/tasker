'use client';

import { useEffect } from 'react';
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
 */
export function SessionSync() {
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession();
  }, [pathname]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession();
      }
    };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return null;
}
