'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { isLoggedIn, userEmail, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
        // Validate passwords match for signup
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

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-sans">
      <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-md border-b border-white/40">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 bg-orange-500 rounded-xl text-white shadow-md shadow-orange-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-800">portoo.io</h2>
            </div>
            <nav className="flex items-center gap-3 sm:gap-8">
              <Link href="/" className="text-sm font-semibold text-stone-500 hover:text-orange-500 transition-colors">
                Create
              </Link>
              <Link href="/explore" className="text-sm font-semibold text-stone-500 hover:text-orange-500 transition-colors">
                Explore
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-10 py-16">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-stone-100 shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-stone-800 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-stone-500">
              {isLogin ? 'Sign in to manage your portfolio' : 'Sign up to create your portfolio'}
            </p>
          </div>

          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 text-center">
                Logged in as <span className="font-semibold">{userEmail}</span>
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={logout} variant="outline" className="flex-1">
                  Logout
                </Button>
                <Button asChild className="bg-orange-500 hover:bg-orange-600 flex-1">
                  <Link href="/">Go to Create</Link>
                </Button>
              </div>
            </div>
          ) : showForgotPassword ? (
            <div className="space-y-5">
              {/* Forgot Password Form */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-stone-800 mb-2">Reset Password</h2>
                <p className="text-sm text-stone-500">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-orange-500 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Google Sign In */}
              <Button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="flex items-center gap-2">
                <div className="h-px bg-stone-200 flex-1" />
                <span className="text-xs text-stone-400 uppercase">or</span>
                <div className="h-px bg-stone-200 flex-1" />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
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
                      className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password - Only for Sign Up */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
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
                        className="w-full h-11 rounded-xl border border-stone-200 bg-white px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                )}

                {/* Forgot Password Link - Only for Login */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || (!isLogin && password !== confirmPassword)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              {/* Toggle Login/Signup */}
              <div className="text-center pt-2">
                <p className="text-sm text-stone-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
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
