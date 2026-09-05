import Link from 'next/link';
import MessagePage from '@/components/MessagePage';
import RandomCardButton from '@/components/RandomCardButton';

export default function CardNotFound() {
  return (
    <MessagePage
      title="No card with that address"
      action={
        <>
          <Link
            href="/"
            className="rounded-md border border-gold-600/60 bg-gold-500/10 px-4 py-2.5 text-sm font-semibold text-gold-200 transition-colors hover:bg-gold-500/20"
          >
            Search for a card
          </Link>
          <RandomCardButton />
        </>
      }
    >
      Scryfall has no card at this address. The link may be old, or the card id may have a typo in
      it.
    </MessagePage>
  );
}
