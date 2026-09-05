'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type JSX } from 'react';
import { Card } from '@/lib/types';
import { fetchCardPrints, PrintsUnique } from '@/lib/api';
import { groupPrintsBySet, printArtKey, printVariantLabels } from '@/lib/prints';
import { CARD_IMAGE_CLASSES, RarityBadge, SetIcon, VariantBadge, formatPrice } from './CardMeta';
import { cn } from '@/lib/utils';

interface VersionGalleryProps {
  // The printing the visitor came from, so the gallery can point it out.
  card: Card;
  initialPrints: Card[];
  total: number;
  initialHasMore: boolean;
  initialUnique: PrintsUnique;
}

const GRID_CLASSES = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4';

function PrintTile({
  print,
  isCurrent,
  sharesArt,
}: {
  print: Card;
  isCurrent: boolean;
  // A different printing of the art the visitor came from, which is the closest the
  // page can get to "you are here" once reprints are folded away.
  sharesArt: boolean;
}): JSX.Element {
  const imageUrl = print.image_uris?.normal ?? print.card_faces?.[0]?.image_uris?.normal;
  const variantLabels = printVariantLabels(print);
  const price = formatPrice(print.prices?.usd);

  const tile = (
    <div
      className={cn(
        'bg-slate-800 rounded-lg overflow-hidden h-full',
        isCurrent && 'ring-2 ring-blue-500',
        sharesArt && 'ring-2 ring-blue-500/50',
        !isCurrent && 'group cursor-pointer transition-shadow hover:shadow-lg hover:shadow-blue-500/50'
      )}
    >
      <div className={CARD_IMAGE_CLASSES}>
        {(isCurrent || sharesArt) && (
          <span
            className={cn(
              'absolute left-2 top-2 z-10 rounded-sm px-2 py-0.5 text-xs font-semibold text-white',
              isCurrent ? 'bg-blue-600' : 'bg-blue-600/70'
            )}
          >
            {isCurrent ? 'Viewing' : 'Same art'}
          </span>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${print.name}, ${print.set_name} #${print.collector_number ?? ''}`}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900">
            <span className="text-slate-400 text-center px-4 text-sm">No image available</span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-200">#{print.collector_number}</span>
          {price && <span className="text-xs font-medium text-slate-300">{price}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {print.rarity && <RarityBadge rarity={print.rarity} />}
          {variantLabels.map((label) => (
            <VariantBadge key={label} label={label} />
          ))}
        </div>
        {print.artist && <p className="text-xs text-slate-400 truncate">{print.artist}</p>}
      </div>
    </div>
  );

  // The printing already on screen behind this gallery is not worth a link back to itself.
  if (isCurrent) {
    return tile;
  }

  return <Link href={`/card/${print.id}`}>{tile}</Link>;
}

export default function VersionGallery({
  card,
  initialPrints,
  total,
  initialHasMore,
  initialUnique,
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

  const groups = useMemo(() => groupPrintsBySet(prints), [prints]);
  const currentArtKey = useMemo(() => printArtKey(card), [card]);

  // The switch changes what a tile stands for, so it changes what to call one.
  const [one, many] = unique === 'art' ? ['art', 'arts'] : ['version', 'versions'];

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const { cards: morePrints, hasMore: moreAvailable } = await fetchCardPrints(
        card,
        nextPage,
        unique
      );
      setPrints((current) => [...current, ...morePrints]);
      setPage(nextPage);
      setHasMore(moreAvailable);
    } finally {
      setIsLoading(false);
    }
  };

  // Scryfall picks the printings, so the switch starts the run again from page one.
  const handleUniqueChange = async (uniqueArtOnly: boolean) => {
    const nextUnique: PrintsUnique = uniqueArtOnly ? 'art' : 'prints';
    setPendingUnique(nextUnique);
    setIsLoading(true);

    try {
      const next = await fetchCardPrints(card, 1, nextUnique);

      // A card with printings has art, so an empty answer here is a refused request
      // rather than a real one. Keeping what is on screen beats blanking the page,
      // and dropping the pending mode puts the switch back where it was.
      if (next.cards.length === 0) {
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
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">We couldn&apos;t find other printings of this card.</p>
        <Link href={`/card/${card.id}`} className="mt-4 inline-block text-blue-400 hover:text-blue-300">
          Back to the card
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-slate-400">
          Showing {prints.length} of {uniqueTotal} {uniqueTotal === 1 ? one : many}
        </p>

        <label
          className={cn(
            'flex items-center gap-2',
            isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          )}
        >
          <input
            type="checkbox"
            checked={(pendingUnique ?? unique) === 'art'}
            disabled={isLoading}
            onChange={(event) => handleUniqueChange(event.target.checked)}
            className="w-4 h-4 rounded-sm bg-slate-800 border border-slate-700 checked:bg-blue-600 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-slate-200">Only unique art</span>
        </label>
      </div>

      {groups.map((group) => (
        <section key={group.code}>
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-800 pb-2">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
              <SetIcon setCode={group.code} />
              {group.name}
            </h2>
            <span className="text-sm text-slate-400">
              {new Date(group.releasedAt).getFullYear()} &middot; {group.cards.length}{' '}
              {group.cards.length === 1 ? one : many}
            </span>
          </div>
          <div className={GRID_CLASSES}>
            {group.cards.map((print) => (
              <PrintTile
                key={print.id}
                print={print}
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
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
          >
            {isLoading ? 'Loading...' : `Load more ${many}`}
          </button>
        </div>
      )}
    </div>
  );
}
