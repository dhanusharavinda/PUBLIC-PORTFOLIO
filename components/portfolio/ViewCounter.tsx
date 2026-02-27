'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewCounterProps {
  username: string;
  initialCount: number;
  className?: string;
}

export function ViewCounter({ username, initialCount, className }: ViewCounterProps) {
  const [count, setCount] = useState(initialCount);
  const [hasIncremented, setHasIncremented] = useState(false);

  useEffect(() => {
    // Check if we've already incremented in this session
    const sessionKey = `viewed_${username}`;
    const hasViewed = sessionStorage.getItem(sessionKey);

    if (!hasViewed && !hasIncremented) {
      // Increment view count
      fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.count) {
            setCount(data.count);
          }
        })
        .catch(console.error);

      sessionStorage.setItem(sessionKey, 'true');
      setHasIncremented(true);
    }
  }, [username, hasIncremented]);

  return (
    <div className={cn('flex items-center gap-1.5 text-sm text-stone-500', className)}>
      <Eye className="w-4 h-4" />
      <span>{count.toLocaleString()} views</span>
    </div>
  );
}
