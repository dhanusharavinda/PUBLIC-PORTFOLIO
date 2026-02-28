'use client';

import React, { createContext, useContext, useEffect, ReactNode, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  userEmail: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  canEditPortfolio: (portfolioEmail: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasHandledInitialEvent = useRef(false);

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

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession ?? null);
      setIsLoaded(true);

      // Ignore the first auth event on app bootstrap to avoid noisy toasts.
      if (!hasHandledInitialEvent.current) {
        hasHandledInitialEvent.current = true;
        return;
      }

      if (event === 'SIGNED_IN') {
        toast.success('Logged in successfully.');
      }
      if (event === 'SIGNED_OUT') {
        toast.success('Logged out.');
      }
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

  const signInWithEmail = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password,
    });

    if (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error;
    }

    toast.success('Welcome back!');
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || password.length < 6) {
      toast.error('Please enter a valid email and password (min 6 characters).');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message || 'Sign up failed.');
      throw error;
    }

    toast.success('Account created successfully! You are now logged in.');
  };

  const resetPassword = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Please enter your email address.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message || 'Failed to send reset email.');
      throw error;
    }

    toast.success('Password reset link sent! Check your email.');
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || 'Logout failed.');
      return;
    }
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
      signUpWithEmail,
      resetPassword,
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
