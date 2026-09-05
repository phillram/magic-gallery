'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type JSX } from 'react';
import { Card } from '@/lib/types';
import { fetchCardPrints, PrintsUnique } from '@/lib/api';
import { appendNewCards } from '@/lib/cards';
import { cardHref } from '@/lib/filter-params';
import { groupPrintsBySet, printArtKey, printVariantLabels } from '@/lib/prints';
import { CARD_IMAGE_CLASSES, RarityBadge, SetIcon, VariantBadge, formatPrice } from './CardMeta';
import { SegmentedControl } from './Controls';
import { cn } from '@/lib/utils';

interface VersionGalleryProps {
  // The printing the visitor came from, so the gallery can point it out.
  card: Card;
  initialPrints: Card[];
  total: number;
  initialHasMore: boolean;
  initialUnique: PrintsUnique;
  // The browse query the visitor started from, kept on every link out of here.
  from?: string;
}

const GRID_CLASSES =
  'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4';

function PrintTile({
  print,
  isCurrent,
  sharesArt,
  from,
}: {
  print: Card;
  isCurrent: boolean;
  // A different printing of the art the visitor came from, which is the closest the
  // page can get to "you are here" once reprints are folded away.
  sharesArt: boolean;
  from?: string;
}): JSX.Element {
  const imageUrl = print.image_uris?.normal ?? print.card_faces?.[0]?.image_uris?.normal;
  const variantLabels = printVariantLabels(print);
  const price = formatPrice(print.prices?.usd);

  const tile = (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border bg-ink-900 transition-colors',
        isCurrent
          ? 'border-gold-400'
          : sharesArt
            ? 'border-gold-600/60 group-hover:border-gold-500'
            : 'border-ink-800 group-hover:border-gold-600/70'
      )}
    >
      <div className={cn(CARD_IMAGE_CLASSES, 'card-frame')}>
        {(isCurrent || sharesArt) && (
          <span
            className={cn(
              'absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold',
              isCurrent ? 'bg-gold-400 text-ink-950' : 'bg-ink-950/85 text-gold-200'
            )}
          >
            {isCurrent ? 'You came from this one' : 'Same art'}
          </span>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${print.name}, ${print.set_name} number ${print.collector_number ?? ''}`}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              'object-contain transition-transform duration-300',
              !isCurrent && 'group-hover:scale-[1.03]'
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-ink-800 to-ink-950 px-4 text-center text-sm text-ink-500">
            No image available
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {print.rarity && <RarityBadge rarity={print.rarity} />}
          {variantLabels.map((label) => (
            <VariantBadge key={label} label={label} />
          ))}
        </div>

        {print.artist && <p className="truncate text-xs text-ink-400">{print.artist}</p>}

        <div className="mt-auto flex items-baseline justify-between gap-2 pt-1">
          <span className="font-mono text-xs text-ink-500">#{print.collector_number}</span>
          {price && <span className="text-xs font-medium text-ink-300">{price}</span>}
        </div>
      </div>
    </article>
  );

  // The printing already on screen behind this gallery is not worth a link back to itself.
  if (isCurrent) {
    return tile;
  }

  return (
    <Link
      href={cardHref(print.id, from)}
      className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
    >
      {tile}
    </Link>
  );
}

export default function VersionGallery({
  card,
  initialPrints,
  total,
  initialHasMore,
  initialUnique,
  from,
}: VersionGalleryProps): JSX.Element {
  const [prints, setPrints] = useState<Card[]>(initialPrints);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [unique, setUnique] = useState<PrintsUnique>(initialUnique);
  // What the switch was moved to, while Scryfall is still answering. The switch shows
  // this at once, so a click never looks ignored, but the gallery below keeps
  // describing the printings that are still on screen.
  const [pendingUnique, setPendingUnique] = useState<PrintsUnique | null>(null);
  // Each mode counts what it shows, so the total moves with the switch.
  const [uniqueTotal, setUniqueTotal] = useState(total);
  const [hasFailed, setHasFailed] = useState(false);

  const groups = useMemo(() => groupPrintsBySet(prints), [prints]);
  const currentArtKey = useMemo(() => printArtKey(card), [card]);

  // The switch changes what a tile stands for, so it changes what to call one.
  const [one, many] = unique === 'art' ? ['art', 'arts'] : ['printing', 'printings'];

  const handleLoadMore = async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const nextPage = page + 1;
      const more = await fetchCardPrints(card, nextPage, unique);

      if (more.cards.length === 0) {
        setHasFailed(true);
        return;
      }

      setPrints((current) => appendNewCards(current, more.cards));
      setPage(nextPage);
      setHasMore(more.hasMore);
    } finally {
      setIsLoading(false);
    }
  };

  // Scryfall picks the printings, so the switch starts the run again from page one.
  const handleUniqueChange = async (nextUnique: PrintsUnique) => {
    if (nextUnique === unique) {
      return;
    }

    setPendingUnique(nextUnique);
    setIsLoading(true);
    setHasFailed(false);

    try {
      const next = await fetchCardPrints(card, 1, nextUnique);

      // A card with printings has art, so an empty answer here is a refused request
      // rather than a real one. Keeping what is on screen beats blanking the page,
      // and dropping the pending mode puts the switch back where it was.
      if (next.cards.length === 0) {
        setHasFailed(true);
        return;
      }

      setUnique(nextUnique);
      setPrints(next.cards);
      setUniqueTotal(next.total);
      setHasMore(next.hasMore);
      setPage(1);
    } finally {
      setPendingUnique(null);
      setIsLoading(false);
    }
  };

  if (prints.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-700 bg-ink-900/50 px-6 py-14 text-center">
        <h2 className="font-display text-xl text-ink-100">Only one printing</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
          We could not find another paper printing of this card.
        </p>
        <Link
          href={cardHref(card.id, from)}
          className="mt-5 inline-block rounded-md border border-ink-600 px-4 py-2 text-sm font-semibold text-ink-200 transition-colors hover:border-gold-500 hover:text-gold-200"
        >
          Back to the card
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-ink-800 bg-ink-900/70 px-4 py-3">
        <p aria-live="polite" className="text-sm text-ink-400">
          {isLoading
            ? 'Loading…'
            : `Showing ${prints.length} of ${uniqueTotal} ${uniqueTotal === 1 ? one : many}`}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-400">Show</span>
          <SegmentedControl
            label="Which printings to show"
            disabled={isLoading}
            options={[
              { value: 'art', label: 'One per art' },
              { value: 'prints', label: 'Every printing' },
            ]}
            value={pendingUnique ?? unique}
            onChange={handleUniqueChange}
          />
        </div>
      </div>

      {hasFailed && (
        <p role="status" className="text-sm text-rarity-mythic">
          Scryfall did not answer. What you see is still correct. Try again in a moment.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.code}>
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-ink-800 pb-2">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-100">
              <SetIcon setCode={group.code} />
              {group.name}
            </h2>
            <span className="text-sm text-ink-500">
              {new Date(group.releasedAt).getFullYear()} · {group.cards.length}{' '}
              {group.cards.length === 1 ? one : many}
            </span>
          </div>
          <div className={GRID_CLASSES}>
            {group.cards.map((print) => (
              <PrintTile
                key={print.id}
                print={print}
                from={from}
                isCurrent={print.id === card.id}
                // Only one printing per art is on the page in this mode, so this marks
                // one tile. Every printing of the art is here in the other mode, where
                // marking them all would be noise.
                sharesArt={
                  unique === 'art' && print.id !== card.id && printArtKey(print) === currentArtKey
                }
              />
            ))}
          </div>
        </section>
      ))}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="rounded-md border border-ink-600 bg-ink-900 px-6 py-3 font-semibold text-ink-100 transition-colors hover:border-gold-500 hover:text-gold-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Loading…' : `Show more ${many}`}
          </button>
        </div>
      )}
    </div>
  );
}
