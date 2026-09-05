'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import MessagePage from '@/components/MessagePage';

// Card data comes from one place, so almost every failure here is Scryfall being
// unreachable. Say that, and offer the one thing that usually works: another try.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MessagePage
      title="We could not load that"
      action={
        <>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-gold-600/60 bg-gold-500/10 px-4 py-2.5 text-sm font-semibold text-gold-200 transition-colors hover:bg-gold-500/20"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-ink-600 px-4 py-2.5 text-sm font-semibold text-ink-200 transition-colors hover:border-gold-500 hover:text-gold-200"
          >
            Back to browsing
          </Link>
        </>
      }
    >
      The card data comes from Scryfall, and the request did not get through. This is usually
      short.
    </MessagePage>
  );
}
