'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useMode } from '@/lib/mode-context';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get('returnTo') || '/';
  const returnTo = rawReturnTo.startsWith('/') ? rawReturnTo : '/';
  const { isLoggedIn, userEmail, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, logout } = useAuth();
  const { isAesthetic } = useMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(returnTo);
    }
  }, [isLoggedIn, returnTo, router]);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }
        await signUpWithEmail(email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword(email);
      setShowForgotPassword(false);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--m-bg-input)',
    borderColor: 'var(--m-border)',
    color: 'var(--m-text)',
    borderRadius: 'var(--m-radius)',
  };

  return (
    <div className="min-h-screen m-transition m-grain" style={{ backgroundColor: 'var(--m-bg)' }}>
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-md border-b m-transition"
        style={{
          backgroundColor: 'var(--m-bg-header)',
          borderColor: 'var(--m-border-header)',
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center size-9 rounded-lg shadow-sm"
                style={{ backgroundColor: 'var(--m-accent)', color: 'var(--m-bg)' }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <h2
                className="text-xl font-extrabold tracking-tight"
                style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
              >
                portlyfolio.site
              </h2>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="text-sm font-semibold transition-colors"
                style={{ color: 'var(--m-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
              >
                Create
              </Link>
              <Link
                href="/explore"
                className="text-sm font-semibold transition-colors"
                style={{ color: 'var(--m-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
              >
                Explore
              </Link>
              <ModeToggle />
            </nav>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-10 py-16">
        <div
          className="max-w-md mx-auto border p-8 animate-fade-in-up m-transition"
          style={{
            backgroundColor: 'var(--m-bg-card)',
            borderColor: 'var(--m-border)',
            borderRadius: 'var(--m-radius-lg)',
            boxShadow: `0 12px 40px var(--m-shadow)`,
          }}
        >
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-extrabold mb-2"
              style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p style={{ color: 'var(--m-text-secondary)' }} className="text-sm">
              {isLogin ? 'Sign in to manage your portfolio' : 'Sign up to create your portfolio'}
            </p>
          </div>

          {isLoggedIn ? (
            <div className="space-y-4">
              <div
                className="rounded-lg border p-4 text-sm text-center"
                style={{
                  backgroundColor: 'var(--m-accent-light)',
                  borderColor: 'var(--m-accent)',
                  color: 'var(--m-accent)',
                }}
              >
                Logged in as <span className="font-semibold">{userEmail}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={logout} className="m-btn-outline flex-1 py-2.5" style={{ borderRadius: 'var(--m-radius)' }}>
                  Logout
                </button>
                <Link href="/" className="m-btn-accent flex-1 py-2.5 text-center" style={{ borderRadius: 'var(--m-radius)' }}>
                  Go to Create
                </Link>
              </div>
            </div>
          ) : showForgotPassword ? (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--m-accent-light)' }}
                >
                  <KeyRound className="w-6 h-6" style={{ color: 'var(--m-accent)' }} />
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
                >
                  Reset Password
                </h2>
                <p className="text-sm" style={{ color: 'var(--m-text-secondary)' }}>
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--m-text)' }}>
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 border px-4 text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{
                      ...inputStyle,
                      '--tw-ring-color': 'var(--m-accent-light)',
                    } as React.CSSProperties}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full m-btn-accent py-2.5 disabled:opacity-50"
                  style={{ borderRadius: 'var(--m-radius)' }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex items-center gap-2 text-sm mx-auto transition-colors"
                style={{ color: 'var(--m-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 border font-medium text-sm transition-all disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--m-bg-card)',
                  borderColor: 'var(--m-border)',
                  color: 'var(--m-text)',
                  borderRadius: 'var(--m-radius)',
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--m-border)' }} />
                <span className="text-xs uppercase" style={{ color: 'var(--m-text-muted)' }}>or</span>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--m-border)' }} />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--m-text)' }}>
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 border px-4 text-sm focus:outline-none focus:ring-2 transition-all"
                    style={inputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--m-text)' }}>
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 chars)'}
                      required
                      minLength={6}
                      className="w-full h-11 border px-4 pr-10 text-sm focus:outline-none focus:ring-2 transition-all"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--m-text-muted)' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--m-text)' }}>
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        minLength={6}
                        className="w-full h-11 border px-4 pr-10 text-sm focus:outline-none focus:ring-2 transition-all"
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'var(--m-text-muted)' }}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm font-medium transition-colors"
                      style={{ color: 'var(--m-accent)' }}
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (!isLogin && password !== confirmPassword)}
                  className="w-full m-btn-accent py-2.5 disabled:opacity-50"
                  style={{ borderRadius: 'var(--m-radius)' }}
                >
                  {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-sm" style={{ color: 'var(--m-text-secondary)' }}>
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="font-semibold transition-colors"
                    style={{ color: 'var(--m-accent)' }}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
