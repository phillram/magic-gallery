import Link from 'next/link';
import MessagePage from '@/components/MessagePage';

export default function NotFound() {
  return (
    <MessagePage
      title="This page is not here"
      action={
        <Link
          href="/"
          className="rounded-md border border-gold-600/60 bg-gold-500/10 px-4 py-2.5 text-sm font-semibold text-gold-200 transition-colors hover:bg-gold-500/20"
        >
          Go to the card browser
        </Link>
      }
    >
      The app has three pages: the browser, a card, and the printings of a card. This address is
      none of them.
    </MessagePage>
  );
}
