'use client';

import { useSearchParams } from 'next/navigation';
import { QRCodeComponent } from '@/components/portfolio/QRCode';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-[#FFF8F5] text-stone-800 font-sans">
      <header className="flex items-center justify-between px-6 md:px-10 py-6 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold">portlyfolio.site</span>
        </Link>
        <Link href="/explore" className="text-sm font-semibold text-stone-500 hover:text-orange-500 transition-colors">
          Explore
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16">
        <div className="max-w-2xl w-full text-center space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm border border-orange-100 text-orange-500 text-sm font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Publication Successful
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-stone-800 tracking-tight leading-tight">
              Your portfolio is live{' '}
              <span className="inline-block animate-bounce">
                <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-orange-500" />
              </span>
            </h1>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/60 p-8 md:p-10 rounded-3xl shadow-[0_20px_40px_-15px_rgba(255,154,139,0.2)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <p className="text-stone-500 text-xs font-bold mb-4 uppercase tracking-[0.2em]">
                Your unique public URL
              </p>
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="px-6 py-3 bg-stone-50 rounded-xl w-full border border-stone-100">
                  <h2 className="text-xl md:text-2xl font-bold text-stone-800 break-all">{portfolioUrl}</h2>
                </div>
                <Button
                  onClick={handleCopy}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-all"
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
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              asChild
              className="flex items-center justify-center gap-3 h-16 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl font-bold text-lg hover:opacity-95 hover:shadow-lg hover:shadow-orange-300/40 transition-all transform hover:-translate-y-0.5"
            >
              <Link href={`/${username}`} target="_blank">
                <ExternalLink className="w-5 h-5" />
                View My Portfolio
              </Link>
            </Button>
            <Button
              onClick={handleShareLinkedIn}
              variant="outline"
              className="flex items-center justify-center gap-3 h-16 bg-white border border-stone-200 text-stone-700 rounded-2xl font-bold text-lg hover:bg-stone-50 hover:border-orange-200 transition-all shadow-sm hover:shadow-md"
            >
              <Linkedin className="w-5 h-5 text-[#0077b5]" />
              Share on LinkedIn
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <QRCodeComponent url={portfolioUrl} />
            <Link
              href={`/?edit=${username}`}
              className="group flex items-center gap-2 text-stone-500 hover:text-orange-500 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/60"
            >
              <div className="p-1.5 bg-stone-100 rounded-lg group-hover:bg-orange-100 transition-colors">
                <Edit3 className="w-5 h-5" />
              </div>
              Edit Portfolio
            </Link>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full px-6 py-10">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-stone-800 text-lg">Pro Tip</p>
              <p className="text-stone-600 text-sm">
                Add your portlyfolio.site link to your resume and email signature to increase visibility.
              </p>
            </div>
          </div>
          <Button variant="outline" className="whitespace-nowrap">
            Update Resume
          </Button>
        </div>
      </footer>
    </div>
  );
}
