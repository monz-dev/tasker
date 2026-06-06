'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/models';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Self-healing: create profile on the fly if it is missing
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: user.user_metadata?.full_name || '',
              role: 'member',
            })
            .select()
            .single();
          if (!insertError) {
            return newProfile as Profile;
          }
        }
      }
      return data as Profile | null;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      let profile: Profile | null = null;
      try {
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error fetching initial profile:', err);
      } finally {
        if (active) {
          setState({
            user: session?.user ?? null,
            profile,
            session,
            loading: false,
          });
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      let profile: Profile | null = null;
      try {
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error fetching profile on auth change:', err);
      } finally {
        if (active) {
          setState({
            user: session?.user ?? null,
            profile,
            session,
            loading: false,
          });
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
}
