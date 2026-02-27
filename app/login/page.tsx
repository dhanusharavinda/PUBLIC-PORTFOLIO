'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { isLoggedIn, userEmail, signInWithGoogle, signInWithEmail, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    try {
      setLoading(true);
      await signInWithEmail(email);
      setEmail('');
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
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-800">buildfol.io</h2>
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
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-stone-100 shadow-xl p-8">
          <h1 className="text-3xl font-extrabold text-stone-800 mb-2">Login</h1>
          <p className="text-stone-500 mb-8">Sign in with Google or email to manage your portfolio.</p>

          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                Logged in as <span className="font-semibold">{userEmail}</span>
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={logout} variant="outline">
                  Logout
                </Button>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href="/">Go to Create</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button type="button" onClick={handleGoogle} disabled={loading} className="w-full bg-stone-900 hover:bg-stone-800">
                Continue with Google
              </Button>

              <div className="flex items-center gap-2">
                <div className="h-px bg-stone-200 flex-1" />
                <span className="text-xs text-stone-400 uppercase">or</span>
                <div className="h-px bg-stone-200 flex-1" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm"
                />
              </div>
              <Button type="button" onClick={handleEmail} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
                Send magic link
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
