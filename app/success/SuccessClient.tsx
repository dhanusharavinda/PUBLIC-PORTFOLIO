'use client';

import { useSearchParams } from 'next/navigation';
import { QRCodeComponent } from '@/components/portfolio/QRCode';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { toast } from 'sonner';
import { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  ExternalLink,
  Linkedin,
  Edit3,
  Sparkles,
} from 'lucide-react';

export function SuccessClient() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'your-username';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const portfolioUrl = `${baseUrl}/${username}`;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen m-transition m-grain" style={{ backgroundColor: 'var(--m-bg)' }}>
      <header
        className="flex items-center justify-between px-6 md:px-10 py-4 sticky top-0 z-50 backdrop-blur-md border-b m-transition"
        style={{
          backgroundColor: 'var(--m-bg-header)',
          borderColor: 'var(--m-border-header)',
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="size-9 rounded-lg flex items-center justify-center shadow-sm"
            style={{ backgroundColor: 'var(--m-accent)', color: 'var(--m-bg)' }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <span
            className="text-lg font-bold"
            style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
          >
            portlyfolio.site
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--m-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
          >
            Explore
          </Link>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
          <div className="space-y-5">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider border"
              style={{
                backgroundColor: 'var(--m-accent-light)',
                borderColor: 'var(--m-border)',
                color: 'var(--m-accent)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Publication Successful
            </div>
            <h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
              style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
            >
              Your portfolio is live{' '}
              <span className="inline-block animate-bounce">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12" style={{ color: 'var(--m-accent)' }} />
              </span>
            </h1>
          </div>

          <div
            className="border p-8 md:p-10 relative overflow-hidden m-transition"
            style={{
              backgroundColor: 'var(--m-bg-card)',
              borderColor: 'var(--m-border)',
              borderRadius: 'var(--m-radius-lg)',
              boxShadow: `0 16px 48px var(--m-shadow-lg)`,
            }}
          >
            <div className="relative z-10">
              <p
                className="text-xs font-bold mb-4 uppercase tracking-[0.2em]"
                style={{ color: 'var(--m-text-muted)' }}
              >
                Your unique public URL
              </p>
              <div className="flex flex-col items-center justify-center gap-5">
                <div
                  className="px-5 py-3 w-full border"
                  style={{
                    backgroundColor: 'var(--m-bg-secondary)',
                    borderColor: 'var(--m-border)',
                    borderRadius: 'var(--m-radius)',
                  }}
                >
                  <h2
                    className="text-lg md:text-xl font-bold break-all"
                    style={{ color: 'var(--m-text-heading)' }}
                  >
                    {portfolioUrl}
                  </h2>
                </div>
                <button
                  onClick={handleCopy}
                  className="m-btn-accent w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3"
                  style={{ borderRadius: 'var(--m-radius)' }}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/${username}`}
              target="_blank"
              className="m-btn-accent flex items-center justify-center gap-3 h-14 font-bold text-base"
              style={{ borderRadius: 'var(--m-radius)' }}
            >
              <ExternalLink className="w-5 h-5" />
              View My Portfolio
            </Link>
            <button
              onClick={handleShareLinkedIn}
              className="m-btn-outline flex items-center justify-center gap-3 h-14 font-bold text-base"
              style={{ borderRadius: 'var(--m-radius)' }}
            >
              <Linkedin className="w-5 h-5 text-[#0077b5]" />
              Share on LinkedIn
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <QRCodeComponent url={portfolioUrl} />
            <Link
              href={`/?edit=${username}`}
              className="group flex items-center gap-2 font-medium px-3 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--m-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
            >
              <div
                className="p-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--m-accent-light)' }}
              >
                <Edit3 className="w-5 h-5" />
              </div>
              Edit Portfolio
            </Link>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full px-6 py-10">
        <div
          className="border p-6 flex flex-col md:flex-row items-center justify-between gap-6 m-transition"
          style={{
            backgroundColor: 'var(--m-bg-card)',
            borderColor: 'var(--m-border)',
            borderRadius: 'var(--m-radius)',
          }}
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'var(--m-accent-light)' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--m-accent)' }} />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: 'var(--m-text-heading)' }}>Pro Tip</p>
              <p className="text-sm" style={{ color: 'var(--m-text-secondary)' }}>
                Add your portlyfolio.site link to your resume and email signature to increase visibility.
              </p>
            </div>
          </div>
          <button className="m-btn-outline whitespace-nowrap px-5 py-2" style={{ borderRadius: 'var(--m-radius)' }}>
            Update Resume
          </button>
        </div>
      </footer>
    </div>
  );
}
