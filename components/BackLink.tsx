import Link from 'next/link';
import type { JSX, ReactNode } from 'react';

// Every page below the browser has one way back, and it says where it goes. "Back"
// alone leaves the visitor to guess whether it means the card, the results, or the
// front page.
export default function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md text-sm text-ink-400 transition-colors hover:text-gold-300"
    >
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}
