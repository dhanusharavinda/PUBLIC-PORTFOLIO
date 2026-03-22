'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AuthHeaderActions } from '@/components/auth/AuthHeaderActions';
import { type ReactNode } from 'react';

export function ExploreShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen m-transition m-grain" style={{ backgroundColor: 'var(--m-bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md m-transition"
        style={{
          backgroundColor: 'var(--m-bg-header)',
          borderColor: 'var(--m-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div
                className="size-9 flex items-center justify-center rounded-lg shadow-sm"
                style={{ backgroundColor: 'var(--m-accent)', color: 'var(--m-bg)' }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <span
                className="text-lg font-extrabold tracking-tight"
                style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
              >
                portlyfolio.site
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'var(--m-accent-light)', color: 'var(--m-accent)' }}
              >
                Explore
              </span>
              <Link
                href="/"
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={{ color: 'var(--m-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
              >
                Create
              </Link>
              <AuthHeaderActions />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 md:px-10 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 m-transition"
        style={{
          backgroundColor: 'var(--m-bg-footer)',
          borderColor: 'var(--m-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="size-7 flex items-center justify-center rounded-md"
              style={{ backgroundColor: 'var(--m-accent)', color: 'var(--m-bg)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span
              className="font-bold text-sm"
              style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
            >
              portlyfolio.site
            </span>
            <span className="text-xs ml-2" style={{ color: 'var(--m-text-muted)' }}>
              &copy; {new Date().getFullYear()}
            </span>
          </div>
          <Link
            href="/"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--m-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
          >
            Create Portfolio
          </Link>
        </div>
      </footer>
    </div>
  );
}
