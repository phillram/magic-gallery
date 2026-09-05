import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { DEFAULT_PRINTS_UNIQUE, fetchCardById, fetchCardPrints } from '@/lib/api';
import { cardHref, sanitizeFrom } from '@/lib/filter-params';
import BackLink from '@/components/BackLink';
import VersionGallery from '@/components/VersionGallery';

interface CardVersionsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CardVersionsPageProps): Promise<Metadata> {
  const { id } = await params;
  const lookup = await fetchCardById(id);

  if (!lookup.card) {
    return { title: 'Card not found' };
  }

  return {
    title: `Every printing of ${lookup.card.name}`,
    description: `Every paper printing of ${lookup.card.name}, grouped by set.`,
  };
}

export default async function CardVersionsPage({ params, searchParams }: CardVersionsPageProps) {
  const { id } = await params;
  const lookup = await fetchCardById(id);
  const from = sanitizeFrom((await searchParams).from);

  if (lookup.card === null && lookup.reason === 'not_found') {
    notFound();
  }

  if (lookup.card === null) {
    throw new Error(lookup.message);
  }

  const card = lookup.card;
  const prints = await fetchCardPrints(card, 1, DEFAULT_PRINTS_UNIQUE);
  const thumbnail = card.image_uris?.small ?? card.card_faces?.[0]?.image_uris?.small;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={cardHref(card.id, from)}>Back to {card.name}</BackLink>

      {/* The card that started this, so a long gallery never leaves the visitor asking
          which card they are looking at printings of. */}
      <div className="flex items-center gap-4">
        {thumbnail && (
          <Image
            src={thumbnail}
            alt=""
            width={146}
            height={204}
            className="card-frame hidden w-20 rounded-lg sm:block"
          />
        )}
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-100 sm:text-4xl">
            Every printing of {card.name}
          </h1>
          <p className="mt-1 text-ink-400">Paper printings only, grouped by set, newest first.</p>
        </div>
      </div>

      <VersionGallery
        card={card}
        from={from}
        initialPrints={prints.cards}
        total={prints.total}
        initialHasMore={prints.hasMore}
        initialUnique={DEFAULT_PRINTS_UNIQUE}
      />
    </div>
  );
}
