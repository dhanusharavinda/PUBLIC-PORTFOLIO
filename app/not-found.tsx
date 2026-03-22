'use client';

import Link from 'next/link';
import { Database, ArrowRight, Sparkles } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';

export default function NotFound() {
  return (
    <div className="min-h-screen m-transition m-grain" style={{ backgroundColor: 'var(--m-bg)' }}>
      {/* Header */}
      <header
        className="w-full border-b backdrop-blur-md sticky top-0 z-50 m-transition"
        style={{
          backgroundColor: 'var(--m-bg-header)',
          borderColor: 'var(--m-border-header)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="size-9 flex items-center justify-center rounded-lg shadow-sm"
              style={{ backgroundColor: 'var(--m-accent)', color: 'var(--m-bg)' }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <h1
              className="text-lg font-extrabold tracking-tight"
              style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
            >
              portlyfolio.site
            </h1>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/explore"
              className="transition-colors"
              style={{ color: 'var(--m-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
            >
              Explore
            </Link>
            <Link
              href="/"
              className="font-semibold transition-colors"
              style={{ color: 'var(--m-text-heading)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-heading)'}
            >
              Create
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl w-full flex flex-col items-center animate-fade-in-up">
          {/* 404 Illustration */}
          <div className="relative w-full max-w-sm aspect-square mb-12 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full blur-3xl transform scale-110 opacity-20"
              style={{ backgroundColor: 'var(--m-accent)' }}
            />
            <div
              className="relative z-10 w-full border-2 p-8 backdrop-blur-sm"
              style={{
                backgroundColor: 'var(--m-bg-card)',
                borderColor: 'var(--m-border)',
                borderRadius: 'var(--m-radius-lg)',
                boxShadow: `0 16px 48px var(--m-shadow-lg)`,
              }}
            >
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: 'var(--m-border)' }}>
                  <div className="flex gap-2">
                    <div className="size-3 rounded-full bg-red-400" />
                    <div className="size-3 rounded-full bg-yellow-400" />
                    <div className="size-3 rounded-full bg-green-400" />
                  </div>
                  <span
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ color: 'var(--m-text-muted)', backgroundColor: 'var(--m-bg-secondary)' }}
                  >
                    query_error.log
                  </span>
                </div>
                <div className="space-y-3 font-mono text-left text-sm">
                  <p style={{ color: 'var(--m-text-secondary)' }}>
                    <span className="font-bold" style={{ color: 'var(--m-accent)' }}>SELECT</span> *{' '}
                    <span className="font-bold" style={{ color: 'var(--m-accent)' }}>FROM</span> portfolios
                  </p>
                  <p style={{ color: 'var(--m-text-secondary)' }}>
                    <span className="font-bold" style={{ color: 'var(--m-accent)' }}>WHERE</span> user_handle ={' '}
                    <span className="font-bold px-1 rounded" style={{ backgroundColor: 'var(--m-accent-light)', color: 'var(--m-accent)' }}>
                      &apos;unknown&apos;
                    </span>;
                  </p>
                  <div
                    className="pt-4 flex items-start gap-3 p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <span className="text-red-400">⚠</span>
                    <p className="text-red-400 text-xs sm:text-sm font-semibold">
                      Row count: 0 (NULL_POINTER_EXCEPTION)
                    </p>
                  </div>
                </div>
                <div
                  className="h-28 w-full rounded-lg flex items-center justify-center overflow-hidden border"
                  style={{
                    backgroundColor: 'var(--m-bg-secondary)',
                    borderColor: 'var(--m-border)',
                  }}
                >
                  <Database className="w-10 h-10" style={{ color: 'var(--m-text-muted)' }} />
                </div>
              </div>
            </div>
            <div
              className="absolute -bottom-5 -right-5 p-2 shadow-lg rotate-6 border"
              style={{
                backgroundColor: 'var(--m-bg-card)',
                borderColor: 'var(--m-border)',
                borderRadius: 'var(--m-radius)',
              }}
            >
              <div
                className="px-5 py-2.5"
                style={{
                  backgroundColor: 'var(--m-accent)',
                  color: 'var(--m-bg)',
                  borderRadius: 'var(--m-radius)',
                }}
              >
                <span className="text-2xl font-extrabold tracking-tighter">404</span>
              </div>
            </div>
          </div>

          <h2
            className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
          >
            404: Data Point Not Found
          </h2>
          <p
            className="text-base mb-10 max-w-lg leading-relaxed"
            style={{ color: 'var(--m-text-secondary)' }}
          >
            This portfolio doesn&apos;t exist yet. It&apos;s like a null value in a perfect dataset — unexpected, but easily fixed!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="m-btn-accent inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-base"
              style={{ borderRadius: 'var(--m-radius)' }}
            >
              <Sparkles className="w-5 h-5" />
              Create yours in 2 minutes
            </Link>
            <Link
              href="/explore"
              className="m-btn-outline inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-base"
              style={{ borderRadius: 'var(--m-radius)' }}
            >
              Explore Portfolios
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full border-t py-8 m-transition"
        style={{
          backgroundColor: 'var(--m-bg-footer)',
          borderColor: 'var(--m-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 opacity-60">
            <div
              className="size-6 flex items-center justify-center rounded"
              style={{ backgroundColor: 'var(--m-accent)', color: 'var(--m-bg)' }}
            >
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--m-text-heading)' }}>
              portlyfolio.site &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors"
              style={{ color: 'var(--m-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-muted)'}
            >
              Create
            </Link>
            <Link
              href="/explore"
              className="transition-colors"
              style={{ color: 'var(--m-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-muted)'}
            >
              Explore
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
