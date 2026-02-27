'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyEmailButtonProps {
  email: string;
  className?: string;
  variant?: 'icon' | 'button' | 'minimal';
  iconSize?: 'sm' | 'md' | 'lg';
}

export function CopyEmailButton({
  email,
  className,
  variant = 'icon',
  iconSize = 'md',
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
          copied
            ? 'bg-green-100 text-green-700'
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200',
          className
        )}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Copy Email
          </>
        )}
      </button>
    );
  }

  // Minimal variant - just the icon, no wrapper or label (for MinimalTemplate)
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'hover:text-indigo-600 transition-colors',
          className
        )}
        title={copied ? 'Copied!' : 'Copy email address'}
      >
        {copied ? (
          <Check className={iconClasses[iconSize]} />
        ) : (
          <Mail className={iconClasses[iconSize]} />
        )}
      </button>
    );
  }

  // Default icon variant with wrapper (for PastelTemplate style)
  return (
    <button
      onClick={handleCopy}
      className={cn(
        'group flex flex-col items-center gap-2 transition-all',
        className
      )}
      title={copied ? 'Copied!' : 'Copy email address'}
    >
      <div
        className={cn(
          'p-4 rounded-full border shadow-sm transition-all transform group-hover:-translate-y-1',
          copied
            ? 'bg-green-100 border-green-200 text-green-600'
            : 'bg-white border-stone-200 text-stone-600 group-hover:text-orange-500'
        )}
      >
        {copied ? <Check className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
      </div>
      <span
        className={cn(
          'text-xs uppercase tracking-widest font-bold transition-colors',
          copied ? 'text-green-600' : 'text-stone-400 group-hover:text-orange-500'
        )}
      >
        {copied ? 'Copied!' : 'Email'}
      </span>
    </button>
  );
}
