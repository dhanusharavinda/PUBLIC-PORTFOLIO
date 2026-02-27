'use client';

import React, { createContext, useContext, useEffect, ReactNode, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  userEmail: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  logout: () => void;
  canEditPortfolio: (portfolioEmail: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth session fetch error:', error);
      }
      if (mounted) {
        setSession(data.session ?? null);
        setIsLoaded(true);
      }
    };

    void init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setIsLoaded(true);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message || 'Google sign-in failed.');
      throw error;
    }
  };

  const signInWithEmail = async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Please enter a valid email.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message || 'Email sign-in failed.');
      throw error;
    }

    toast.success('Magic link sent. Check your email to sign in.');
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || 'Logout failed.');
      return;
    }
    toast.success('Logged out.');
  };

  const user = session?.user ?? null;
  const userEmail = user?.email ?? null;
  const isLoggedIn = Boolean(user);

  const canEditPortfolio = (portfolioEmail: string) => {
    if (!portfolioEmail || !userEmail) return false;
    return portfolioEmail.toLowerCase() === userEmail.toLowerCase();
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      isLoggedIn,
      user,
      userEmail,
      signInWithGoogle,
      signInWithEmail,
      logout,
      canEditPortfolio,
    }),
    [isLoggedIn, user, userEmail]
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
