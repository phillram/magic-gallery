'use client';

import type { JSX } from 'react';
import { Card } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { cardHref } from '@/lib/filter-params';
import { ManaCost } from './ManaSymbols';
import { CARD_IMAGE_CLASSES, RarityBadge, SetIcon, formatPrice } from './CardMeta';
import { cn } from '@/lib/utils';

interface CardGridProps {
  cards: Card[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  // Scryfall was not reachable, which is not the same as "nothing matched".
  failed: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  hasFilters: boolean;
  // The browse query to carry onto each card, so the card page can offer a way back
  // to this exact set of results.
  from?: string;
}

const GRID_CLASSES =
  'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5';

const SKELETON_COUNT = 12;

function CardSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-800 bg-ink-900">
      <div className={cn(CARD_IMAGE_CLASSES, 'animate-pulse bg-ink-800')} />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded-sm bg-ink-800" />
        <div className="h-3 w-1/2 animate-pulse rounded-sm bg-ink-800" />
      </div>
    </div>
  );
}

function EmptyPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: string;
  action?: JSX.Element;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-dashed border-ink-700 bg-ink-900/50 px-6 py-14 text-center">
      <h2 className="font-display text-xl text-ink-100">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">{children}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function CardTile({ card, from }: { card: Card; from?: string }): JSX.Element {
  const imageUrl = card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;
  const price = formatPrice(card.prices?.usd);

  return (
    <Link
      href={cardHref(card.id, from)}
      className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ink-800 bg-ink-900 transition-colors group-hover:border-gold-600/70">
        <div className={cn(CARD_IMAGE_CLASSES, 'card-frame')}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={card.name}
              fill
              sizes="(min-width: 1536px) 16vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-ink-800 to-ink-950 px-4 text-center text-sm text-ink-500">
              No image available
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-sm leading-snug font-semibold text-ink-100 transition-colors group-hover:text-gold-200 line-clamp-2">
              {card.name}
            </h3>
            {card.mana_cost && <ManaCost cost={card.mana_cost} className="shrink-0 text-xs" />}
          </div>

          <p className="truncate text-xs text-ink-400">{card.type_line}</p>

          <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-ink-500">
            <SetIcon setCode={card.set} />
            <span className="truncate">{card.set_name}</span>
          </p>

          <div className="flex items-center justify-between gap-2">
            {card.rarity ? <RarityBadge rarity={card.rarity} /> : <span />}
            {price && <span className="text-xs font-medium text-ink-300">{price}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function CardGrid({
  cards,
  isLoading,
  onLoadMore,
  hasMore,
  failed,
  onRetry,
  onClearFilters,
  hasFilters,
  from,
}: CardGridProps): JSX.Element {
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

  if (failed && cards.length === 0) {
    return (
      <EmptyPanel
        title="Scryfall did not answer"
        action={
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-gold-600/60 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-200 transition-colors hover:bg-gold-500/20"
          >
            Try again
          </button>
        }
      >
        The card data comes from Scryfall, and the request did not get through. Your filters are
        safe. Try again in a moment.
      </EmptyPanel>
    );
  }

  if (cards.length === 0) {
    return (
      <EmptyPanel
        title="No card matches"
        action={
          hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-md border border-ink-600 px-4 py-2 text-sm font-semibold text-ink-200 transition-colors hover:border-gold-500 hover:text-gold-200"
            >
              Clear all filters
            </button>
          ) : undefined
        }
      >
        Nothing in the paper card list fits every filter you set. Remove one filter, or search for
        a different name.
      </EmptyPanel>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Refining a search keeps the current results in place and dims them, so the page
          does not jump while the next set loads. */}
      <div
        className={cn(GRID_CLASSES, isLoading && 'opacity-50 transition-opacity')}
        aria-busy={isLoading}
      >
        {cards.map((card) => (
          <CardTile key={card.id} card={card} from={from} />
        ))}
      </div>

      {/* A page that never arrived leaves the cards above it untouched, so the failure
          has to be said here. Without it the button goes back to its resting state and
          the visitor reads that as the end of the results. */}
      {failed && (
        <p role="status" className="text-center text-sm text-rarity-mythic">
          Scryfall did not answer, so no more cards were added. Try again in a moment.
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-md border border-ink-600 bg-ink-900 px-6 py-3 font-semibold text-ink-100 transition-colors hover:border-gold-500 hover:text-gold-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Loading…' : failed ? 'Try again' : 'Show more cards'}
          </button>
        </div>
      )}
    </div>
  );
}
