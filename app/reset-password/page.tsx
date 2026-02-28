'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid reset token in the URL
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      // No token, redirect to login
      toast.error('Invalid or expired reset link');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message || 'Failed to reset password');
        return;
      }

      setSuccess(true);
      toast.success('Password updated successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      toast.error('Something went wrong');
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
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-800">portlyfolio.site</h2>
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
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800">Password Updated!</h1>
              <p className="text-stone-500">Your password has been successfully reset. Redirecting to login...</p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-stone-800 mb-2">Reset Password</h1>
                <p className="text-stone-500">Enter your new password below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
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

                <Button
                  type="submit"
                  disabled={loading || password !== confirmPassword || password.length < 6}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
