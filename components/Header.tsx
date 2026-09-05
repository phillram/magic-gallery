import Link from 'next/link';
import type { JSX } from 'react';
import { COLORS } from '@/lib/mtg';
import { ManaSymbol } from './ManaSymbols';
import RandomCardButton from './RandomCardButton';

// White, blue, black, red, green: the order the symbols sit in on a card, and the order
// the color filter lists them in. The sixth entry of COLORS is colorless, which is the
// absence of the other five and has no place in a mark that stands for all of them.
const MARK_COLORS = COLORS.filter((color) => color !== 'C');

export default function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[104rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md py-1 transition-colors hover:text-gold-300"
        >
          {/* Each symbol is a sun, a drop, a skull, a fireball and a tree, and they only
              read as those with a gap between them. The height is fixed in em, so the row
              holds its size while the files load and the wordmark never shifts. */}
          <span className="flex items-center gap-0.5 text-lg">
            {MARK_COLORS.map((color) => (
              <ManaSymbol key={color} symbol={`{${color}}`} decorative />
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
