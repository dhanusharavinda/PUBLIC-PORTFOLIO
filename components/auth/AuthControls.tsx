'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function AuthControls() {
  const { isLoggedIn, userEmail, logout } = useAuth();

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
    <Button asChild className="h-8 px-4 text-xs bg-orange-500 hover:bg-orange-600">
      <Link href="/login">Login</Link>
    </Button>
  );
}
