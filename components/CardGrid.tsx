'use client';

import { Card } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { ManaCost } from './ManaSymbols';
import { RarityBadge, SetIcon, formatPrice } from './CardMeta';
import { cn } from '@/lib/utils';

interface CardGridProps {
  cards: Card[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

const GRID_CLASSES = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

// Magic cards are 63x88mm, and Scryfall's images keep that shape. Holding the same
// ratio here means the art is never cropped and a card never changes size as it loads.
const CARD_IMAGE_CLASSES = 'relative w-full aspect-[5/7] bg-slate-900 overflow-hidden';

const SKELETON_COUNT = 8;

function CardSkeleton(): JSX.Element {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden h-full">
      <div className={cn(CARD_IMAGE_CLASSES, 'animate-pulse bg-slate-700')} />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-700 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-slate-700 animate-pulse" />
      </div>
    </div>
  );
}

export default function CardGrid({ cards, isLoading, onLoadMore, hasMore }: CardGridProps): JSX.Element {
  const isFirstLoad = isLoading && cards.length === 0;

  if (isFirstLoad) {
    return (
      <div className={GRID_CLASSES} aria-busy="true" aria-label="Loading cards">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">No cards found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Refining a search keeps the current results in place and dims them, so the page
          does not jump while the next set loads. */}
      <div
        className={cn(GRID_CLASSES, isLoading && 'opacity-50 transition-opacity')}
        aria-busy={isLoading}
      >
        {cards.map((card, index) => {
          const imageUrl = card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;

          return (
            <Link
              href={`/card/${card.id}`}
              key={card.id}
            >
              <div className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow hover:shadow-blue-500/50 h-full cursor-pointer group">
                <div className={CARD_IMAGE_CLASSES}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={card.name}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                      <span className="text-slate-400 text-center px-4">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-100 line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {card.name}
                    </h3>
                    {card.mana_cost && <ManaCost cost={card.mana_cost} className="shrink-0 text-sm" />}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <SetIcon setCode={card.set} />
                    <span className="truncate">{card.set_name}</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {card.rarity ? <RarityBadge rarity={card.rarity} /> : <span />}
                    {formatPrice(card.prices?.usd) && (
                      <span className="text-xs font-medium text-slate-300">
                        {formatPrice(card.prices?.usd)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
          >
            {isLoading ? 'Loading...' : 'Load More Cards'}
          </button>
        </div>
      )}
    </div>
  );
}
