import { useState } from 'react';
import type { Profile } from '../types/models';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: (ctx: { user: User; profile: Profile | null; signOut: () => Promise<void> }) => React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-petroleum-blue animate-spin" />
          <p className="text-sm text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  return <>{children({ user, profile, signOut })}</>;
}

function LoginScreen({
  onSignIn,
  onSignUp,
}: {
  onSignIn: (email: string, password: string) => Promise<{ error: unknown }>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<{ error: unknown }>;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await onSignIn(email, password);
        if (error) setError((error as Error).message);
      } else {
        if (!fullName.trim()) {
          setError('Please enter your name');
          setSubmitting(false);
          return;
        }
        const { error } = await onSignUp(email, password, fullName);
        if (error) {
          setError((error as Error).message);
        } else {
          setRegistered(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50 p-8">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-on-secondary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-petroleum-blue mb-2">Check your email</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              We sent a confirmation link to <span className="font-medium text-primary">{email}</span>
            </p>
            <button
              onClick={() => { setRegistered(false); setMode('login'); }}
              className="text-sm font-medium text-sage-accent hover:underline"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-petroleum-blue tracking-tight mb-1">Stone & Sage</h1>
          <p className="text-sm text-on-surface-variant">Project Management</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50 p-8">
          <h2 className="text-lg font-semibold text-primary mb-6">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  Full name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-on-surface-variant mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-error-container/50 border border-error/20 rounded-lg">
                <p className="text-xs text-on-error-container">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-petroleum-blue text-white rounded-xl text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm text-on-surface-variant hover:text-petroleum-blue transition-colors"
            >
              {mode === 'login' ? (
                <>No account? <span className="font-medium text-sage-accent">Create one</span></>
              ) : (
                <>Already have an account? <span className="font-medium text-sage-accent">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
