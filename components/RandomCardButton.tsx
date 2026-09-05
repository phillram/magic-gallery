'use client';

import { fetchRandomCard } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, type JSX } from 'react';
import { cn } from '@/lib/utils';

interface RandomCardButtonProps {
  size?: 'compact' | 'regular';
  className?: string;
}

function DieIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="currentColor">
      <path
        d="M5 3.5h14A1.5 1.5 0 0 1 20.5 5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8.5" cy="8.5" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="15.5" cy="15.5" r="1.4" />
    </svg>
  );
}

export default function RandomCardButton({
  size = 'regular',
  className,
}: RandomCardButtonProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  // Scryfall can refuse the request, and a button that goes quiet leaves the visitor
  // clicking it again. Say what happened instead.
  const [hasFailed, setHasFailed] = useState(false);
  const router = useRouter();

  const handleRandomCard = async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const card = await fetchRandomCard();

      if (card) {
        router.push(`/card/${card.id}`);
        return;
      }

      setHasFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-3">
      {hasFailed && (
        <span role="status" className="text-sm text-rarity-mythic">
          Could not reach Scryfall. Try again.
        </span>
      )}
      <button
        type="button"
        onClick={handleRandomCard}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-gold-600/60 bg-gold-500/10 font-semibold text-gold-200 transition-colors hover:border-gold-500 hover:bg-gold-500/20 disabled:cursor-not-allowed disabled:opacity-60',
          size === 'compact' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm',
          className
        )}
      >
        <DieIcon />
        {isLoading ? 'Drawing…' : 'Random card'}
      </button>
    </span>
  );
}
