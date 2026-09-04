import { fetchCardById, CardLookup } from '@/lib/api';
import CardDetail from '@/components/CardDetail';
import Header from '@/components/Header';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CardPageProps {
  params: { id: string };
}

export default async function CardPage({ params }: CardPageProps) {
  const lookup = await fetchCardById(params.id);

  if (!lookup.card) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to Cards
        </Link>
        <CardDetail card={lookup.card} />
      </div>
    </div>
  );
}
