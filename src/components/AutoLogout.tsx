'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * AutoLogout component monitors user activity and automatically signs out
 * the user after 2 minutes (120,000 ms) of inactivity.
 * 
 * To avoid performance degradation from resetting timeouts on high-frequency
 * events like mousemove or scroll, we store the last activity timestamp in a ref
 * and check it periodically via a slow interval.
 */
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
const CHECK_INTERVAL_MS = 5000; // Check every 5 seconds

export function AutoLogout() {
  const { user, signOut } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out during auto-logout:', err);
    } finally {
      // Force a hard reload/redirect to clear all in-memory store states
      window.location.href = '/login';
    }
  }, [signOut]);

  useEffect(() => {
    // Only monitor activity if there is an active user session
    if (!user) return;

    // Initialize/reset last activity on mount or user changes
    lastActivityRef.current = Date.now();

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Listen to standard interaction events
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'mousedown', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check periodically if the inactivity threshold has been exceeded
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        clearInterval(intervalId);
        handleAutoLogout();
      }
    }, CHECK_INTERVAL_MS);

    // Immediate check when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          clearInterval(intervalId);
          handleAutoLogout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, handleAutoLogout]);

  return null;
}
