'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function AuthControls() {
  const { isLoggedIn, userEmail, signInWithGoogle, signInWithEmail, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmail = async () => {
    try {
      setIsLoading(true);
      await signInWithEmail(email);
      setEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden md:inline text-xs text-stone-500 max-w-[180px] truncate">{userEmail}</span>
        <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={logout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email login"
        className="h-8 w-[150px] rounded-md border border-stone-200 bg-white px-2 text-xs"
      />
      <Button type="button" className="h-8 px-3 text-xs bg-orange-500 hover:bg-orange-600" onClick={handleEmail} disabled={isLoading}>
        Email
      </Button>
      <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={handleGoogle} disabled={isLoading}>
        Google
      </Button>
    </div>
  );
}
