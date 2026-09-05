import { DEFAULT_PRINTS_UNIQUE, fetchCardById, fetchCardPrints } from '@/lib/api';
import Header from '@/components/Header';
import VersionGallery from '@/components/VersionGallery';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CardVersionsPageProps {
  params: { id: string };
}

export default async function CardVersionsPage({ params }: CardVersionsPageProps) {
  const lookup = await fetchCardById(params.id);

  if (!lookup.card) {
    notFound();
  }

  const card = lookup.card;
  const prints = await fetchCardPrints(card, 1, DEFAULT_PRINTS_UNIQUE);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href={`/card/${card.id}`}
          className="text-blue-400 hover:text-blue-300 mb-6 inline-block"
        >
          ← Back to {card.name}
        </Link>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">All versions of {card.name}</h1>
        <p className="text-slate-400 mb-8">Paper printings, grouped by set, newest first.</p>
        <VersionGallery
          card={card}
          initialPrints={prints.cards}
          total={prints.total}
          initialHasMore={prints.hasMore}
          initialUnique={DEFAULT_PRINTS_UNIQUE}
        />
      </div>
    </div>
  );
}
