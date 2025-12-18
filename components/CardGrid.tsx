'use client';

import { Card } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface CardGridProps {
  cards: Card[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function CardGrid({ cards, isLoading, onLoadMore, hasMore }: CardGridProps) {
  return (
    <div className="flex flex-col gap-6">
      {cards.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No cards found. Try adjusting your filters.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="ml-4 text-slate-300">Loading cards...</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link href={`/card/${card.id}`} key={card.id}>
            <div className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow hover:shadow-blue-500/50 h-full cursor-pointer group">
              <div className="relative w-full h-80 bg-slate-700 flex items-center justify-center overflow-hidden">
                {card.image_uris?.normal ? (
                  <Image
                    src={card.image_uris.normal}
                    alt={card.name}
                    width={250}
                    height={350}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : card.card_faces?.[0]?.image_uris?.normal ? (
                  <Image
                    src={card.card_faces[0].image_uris.normal}
                    alt={card.name}
                    width={250}
                    height={350}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                    <span className="text-slate-400 text-center px-4">No image available</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-100 line-clamp-2 group-hover:text-blue-300 transition-colors">
                  {card.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{card.set_name}</p>
                {card.rarity && (
                  <p className="text-xs text-slate-400 capitalize">Rarity: {card.rarity}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && !isLoading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            Load More Cards
          </button>
        </div>
      )}
    </div>
  );
}
