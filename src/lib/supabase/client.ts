import { createBrowserClient } from '@supabase/ssr';

// Singleton for client components — created once, persists across navigations
// The @supabase/ssr client handles token refresh and session persistence automatically
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  }
);
