'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { fetchJson } from '@/lib/fetch-json';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, FolderOpen, User } from 'lucide-react';

interface MyPortfolioItem {
  id: string;
  username: string;
  full_name: string;
  job_title: string;
  is_public: boolean;
  updated_at: string;
}

export function AuthHeaderActions() {
  const { isLoggedIn, userEmail, logout } = useAuth();
  const [portfolio, setPortfolio] = useState<MyPortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMyPortfolio = async () => {
      if (!isLoggedIn) {
        setPortfolio(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setPortfolio(null);
          return;
        }

        const result = await fetchJson<{ success: boolean; portfolios: MyPortfolioItem[] }>('/api/my-portfolios', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Take only the first portfolio (enforced one per user)
        const portfolios = Array.isArray(result.portfolios) ? result.portfolios : [];
        setPortfolio(portfolios[0] || null);
      } catch (error) {
        console.error('Header my portfolio fetch failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadMyPortfolio();
  }, [isLoggedIn]);

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden md:inline text-xs text-stone-500 max-w-[180px] truncate">{userEmail}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="h-9 px-3 text-xs gap-1">
              <FolderOpen className="w-4 h-4" />
              My Portfolio
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>My Portfolio</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {isLoading ? (
              <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
            ) : portfolio ? (
              <>
                <DropdownMenuItem className="cursor-default">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-400" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{portfolio.full_name}</span>
                      <span className="text-xs text-stone-500">@{portfolio.username}</span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${portfolio.username}`} className="w-full">
                    View Portfolio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/?edit=${portfolio.username}`} className="w-full">
                    Edit Portfolio
                  </Link>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/" className="w-full">
                  Create Your Portfolio
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Button asChild className="h-9 px-4 text-xs bg-orange-500 hover:bg-orange-600">
      <Link href="/login">Login</Link>
    </Button>
  );
}
