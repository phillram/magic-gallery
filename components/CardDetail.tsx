'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type JSX, type ReactNode } from 'react';
import { Card, CardFace } from '@/lib/types';
import { getExternalLinks } from '@/lib/api';
import { versionsHref } from '@/lib/filter-params';
import { LEGALITY_LABELS, SHOWN_FORMATS } from '@/lib/mtg';
import { cn } from '@/lib/utils';
import { ManaCost, SymbolText } from './ManaSymbols';
import { SegmentedControl } from './Controls';
import { RarityBadge, SetIcon, formatPrice } from './CardMeta';

interface CardDetailProps {
  card: Card;
  // The browse query the visitor came from, carried on to the versions page so the
  // trail back to their results is not broken by one more step.
  from?: string;
}

const LEGALITY_CLASSES: Record<string, string> = {
  legal: 'text-mana-g',
  restricted: 'text-gold-300',
  banned: 'text-rarity-mythic',
  not_legal: 'text-ink-500',
};

// A creature prints power and toughness, a planeswalker prints loyalty, and a battle
// prints defense. All three sit in the same corner of the card.
function statLine(face: Card | CardFace): { label: string; value: string } | null {
  if (face.power && face.toughness) {
    return { label: 'Power and toughness', value: `${face.power}/${face.toughness}` };
  }
  if (face.loyalty) {
    return { label: 'Loyalty', value: face.loyalty };
  }
  if (face.defense) {
    return { label: 'Defense', value: face.defense };
  }
  return null;
}

function Fact({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-100">{children}</dd>
    </div>
  );
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <section className={cn('rounded-xl border border-ink-800 bg-ink-900/60 p-5', className)}>
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-300">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function CardDetail({ card, from }: CardDetailProps): JSX.Element {
  const [faceIndex, setFaceIndex] = useState(0);

  const faces = card.card_faces ?? [];
  const hasFaces = faces.length > 1;
  const face = hasFaces ? faces[faceIndex] : null;
  const shown = face ?? card;

  const imageUrl = shown.image_uris?.large ?? card.image_uris?.large;
  const stats = statLine(shown);
  const externalLinks = getExternalLinks(card);
  const usd = formatPrice(card.prices?.usd);
  const usdFoil = formatPrice(card.prices?.usd_foil);
  const eur = formatPrice(card.prices?.eur, '€');
  const artist = shown.artist ?? card.artist;

  return (
    <article className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
      {/* The name comes before the picture in the reading order. In a narrow window
          the picture is a whole screen tall, and a visitor should not have to scroll
          past it to learn which card they opened. */}
      <header className="lg:col-start-2 lg:row-start-1">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-display text-3xl font-bold leading-tight text-ink-100 sm:text-4xl">
            {shown.name}
          </h1>
          {shown.mana_cost && <ManaCost cost={shown.mana_cost} className="text-2xl" />}
        </div>
        <p className="mt-2 text-ink-300">{shown.type_line}</p>
      </header>

      {/* The image stays with the visitor while they read down a long card. */}
      <div className="lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
        <div className="mx-auto max-w-sm">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={shown.name}
              width={488}
              height={680}
              className="card-frame w-full"
              priority
            />
          ) : (
            <div className="flex aspect-5/7 w-full items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-sm text-ink-500">
              No image available
            </div>
          )}

          {hasFaces && (
            <div className="mt-4 flex justify-center">
              <SegmentedControl
                label="Card face"
                options={faces.map((entry, index) => ({
                  value: String(index),
                  label: entry.name,
                }))}
                value={String(faceIndex)}
                onChange={(value) => setFaceIndex(Number(value))}
              />
            </div>
          )}

          {/* The gallery shows paper printings, so a card that only ever existed online
              has nothing to open. The link used to lead to an empty page. */}
          {card.games.includes('paper') && (
            <Link
              href={versionsHref(card.id, from)}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-gold-600/60 bg-gold-500/10 px-4 py-3 text-sm font-semibold text-gold-200 transition-colors hover:border-gold-400 hover:bg-gold-500/20"
            >
              See every printing of this card
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:col-start-2 lg:row-start-2">
        {/* The rules text sits in its own box on a printed card, in a serif. This is
            the same box, so the card reads the way it does in the hand. */}
        {(shown.oracle_text || shown.flavor_text) && (
          <div className="text-box rounded-xl p-5">
            {shown.oracle_text && (
              <p className="whitespace-pre-wrap font-card text-[0.975rem] leading-relaxed text-ink-100">
                <SymbolText text={shown.oracle_text} />
              </p>
            )}

            {shown.flavor_text && (
              <p className="mt-4 border-t border-ink-700 pt-4 font-card text-sm italic leading-relaxed text-ink-400">
                {shown.flavor_text}
              </p>
            )}

            {stats && (
              <p className="mt-4 flex justify-end">
                <span
                  aria-label={stats.label}
                  className="rounded-md border border-ink-600 bg-ink-950/60 px-3 py-1 font-display text-lg font-bold text-ink-100"
                >
                  {stats.value}
                </span>
              </p>
            )}
          </div>
        )}

        <Panel title="This printing">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Fact label="Set">
              <SetIcon setCode={card.set} />
              <span className="truncate">{card.set_name}</span>
            </Fact>
            {card.collector_number && (
              <Fact label="Collector number">#{card.collector_number}</Fact>
            )}
            {card.rarity && (
              <Fact label="Rarity">
                <RarityBadge rarity={card.rarity} />
              </Fact>
            )}
            <Fact label="Mana value">{shown.cmc ?? card.cmc}</Fact>
            {artist && <Fact label="Artist">{artist}</Fact>}
            <Fact label="Released">
              {new Date(card.released_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Fact>
            {card.edhrec_rank && (
              <Fact label="Commander rank">
                #{card.edhrec_rank.toLocaleString('en-US')}
              </Fact>
            )}
          </dl>

          {(usd || usdFoil || eur) && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-800 pt-4">
              {usd && <PriceChip label="Normal" value={usd} />}
              {usdFoil && <PriceChip label="Foil" value={usdFoil} />}
              {eur && <PriceChip label="Europe" value={eur} />}
            </div>
          )}
        </Panel>

        {card.legalities && (
          <Panel title="Where you can play it">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
              {SHOWN_FORMATS.filter((format) => card.legalities?.[format.key]).map((format) => {
                const status = card.legalities?.[format.key] ?? 'not_legal';
                return (
                  <li key={format.key} className="text-sm">
                    <span className="text-ink-300">{format.label}</span>{' '}
                    <span className={cn('font-medium', LEGALITY_CLASSES[status] ?? 'text-ink-400')}>
                      {LEGALITY_LABELS[status] ?? status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        <Panel title="Read more elsewhere">
          <ul className="grid gap-2 sm:grid-cols-2">
            {externalLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-3 rounded-lg border border-ink-800 px-3 py-2.5 transition-colors hover:border-gold-600/60 hover:bg-ink-850"
                >
                  <span className="text-sm font-medium text-ink-100">
                    {link.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                  <span className="text-xs text-ink-500">{link.hint}</span>
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </article>
  );
}

function PriceChip({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <span className="inline-flex items-baseline gap-2 rounded-lg border border-ink-800 bg-ink-950/50 px-3 py-1.5">
      <span className="text-xs uppercase tracking-wide text-ink-500">{label}</span>
      <span className="text-sm font-semibold text-ink-100">{value}</span>
    </span>
  );
}
