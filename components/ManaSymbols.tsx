import type { JSX } from 'react';
import { cn } from '@/lib/utils';

const SYMBOL_BASE_URL = 'https://svgs.scryfall.io/card-symbols';

// Scryfall writes symbols in braces, as in {2}, {U} or {W/P}.
const SYMBOL_SOURCE = '\\{[^}]+\\}';
const ALL_SYMBOLS = new RegExp(SYMBOL_SOURCE, 'g');
const SPLIT_ON_SYMBOLS = new RegExp(`(${SYMBOL_SOURCE})`, 'g');
const IS_SYMBOL = new RegExp(`^${SYMBOL_SOURCE}$`);

// Scryfall names each file after the symbol with the braces and slashes stripped, so
// {U} is U.svg and {2/W} is 2W.svg. A symbol with no file falls back to its alt text.
function symbolUrl(symbol: string): string {
  return `${SYMBOL_BASE_URL}/${symbol.replace(/[{}/]/g, '')}.svg`;
}

// Sized in em so symbols follow the surrounding text. A symbol standing in rules text
// is content, and its braces are worth reading out and worth a tooltip. The same symbol
// in a logo is decoration, and a row of "{W}" tooltips over a wordmark is noise.
export function ManaSymbol({
  symbol,
  className,
  decorative,
}: {
  symbol: string;
  className?: string;
  decorative?: boolean;
}): JSX.Element {
  return (
    <img
      src={symbolUrl(symbol)}
      alt={decorative ? '' : symbol}
      title={decorative ? undefined : symbol}
      className={cn('inline-block h-[1em] w-[1em] align-[-0.125em]', className)}
    />
  );
}

export function ManaCost({ cost, className }: { cost?: string | null; className?: string }): JSX.Element {
  const symbols = cost?.match(ALL_SYMBOLS);

  if (!symbols?.length) {
    return <span className={className}>{cost || 'N/A'}</span>;
  }

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {symbols.map((symbol, index) => (
        <ManaSymbol key={`${symbol}-${index}`} symbol={symbol} />
      ))}
    </span>
  );
}

// Card text mixes prose with symbols, as in "{T}: Add {G}". Splitting on a capturing
// group keeps the symbols in the output so each one can be swapped for its image.
export function SymbolText({ text, className }: { text: string; className?: string }): JSX.Element {
  const parts = text.split(SPLIT_ON_SYMBOLS);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        IS_SYMBOL.test(part) ? <ManaSymbol key={index} symbol={part} /> : part
      )}
    </span>
  );
}
