import Link from 'next/link';
import type { JSX } from 'react';
import RandomCardButton from './RandomCardButton';

// The five colors in the order the mana symbols sit on a card: white, blue, black,
// red, green. Drawn here rather than loaded, so the mark is on screen with the page.
const MANA_PIPS = [
  { color: 'W', className: 'bg-mana-w' },
  { color: 'U', className: 'bg-mana-u' },
  { color: 'B', className: 'bg-mana-b' },
  { color: 'R', className: 'bg-mana-r' },
  { color: 'G', className: 'bg-mana-g' },
];

export default function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[104rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md py-1 transition-colors hover:text-gold-300"
        >
          <span aria-hidden="true" className="flex items-center -space-x-1">
            {MANA_PIPS.map((pip) => (
              <span
                key={pip.color}
                className={`h-3 w-3 rounded-full ring-1 ring-ink-950/60 ${pip.className}`}
              />
            ))}
          </span>
          <span className="font-display text-lg font-bold tracking-wide text-gold-200 transition-colors group-hover:text-gold-300 sm:text-xl">
            Magic Card Browser
          </span>
        </Link>

        <RandomCardButton size="compact" />
      </div>
    </header>
  );
}
