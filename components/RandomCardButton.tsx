'use client';

import { fetchRandomCard } from '@/lib/api';
import { Card } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RandomCardButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRandomCard = async () => {
    setIsLoading(true);
    try {
      const card = await fetchRandomCard();
      if (card) {
        router.push(`/card/${card.id}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRandomCard}
      disabled={isLoading}
      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors font-semibold"
    >
      {isLoading ? 'Finding Card...' : '🎲 Random Card'}
    </button>
  );
}
