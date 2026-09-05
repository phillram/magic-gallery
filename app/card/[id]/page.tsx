import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCardById } from '@/lib/api';
import { browseHref, sanitizeFrom } from '@/lib/filter-params';
import BackLink from '@/components/BackLink';
import CardDetail from '@/components/CardDetail';

interface CardPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// A shared link should show the card, not the name of the whole app, and a chat window
// should be able to draw the card next to it.
export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const { id } = await params;
  const lookup = await fetchCardById(id);

  if (!lookup.card) {
    return { title: 'Card not found' };
  }

  const card = lookup.card;
  const image = card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;

  return {
    title: card.name,
    description: `${card.type_line} · ${card.set_name}`,
    openGraph: {
      title: card.name,
      description: `${card.type_line} · ${card.set_name}`,
      images: image ? [{ url: image, width: 488, height: 680, alt: card.name }] : undefined,
    },
  };
}

export default async function CardPage({ params, searchParams }: CardPageProps) {
  const { id } = await params;
  const lookup = await fetchCardById(id);
  const from = sanitizeFrom((await searchParams).from);

  if (lookup.card === null && lookup.reason === 'not_found') {
    notFound();
  }

  // A refused request is not a missing card. Throwing sends it to the error page, which
  // offers another try, instead of telling the visitor their card does not exist.
  if (lookup.card === null) {
    throw new Error(lookup.message);
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={browseHref(from)}>{from ? 'Back to your results' : 'Back to browsing'}</BackLink>
      <CardDetail card={lookup.card} from={from} />
    </div>
  );
}
