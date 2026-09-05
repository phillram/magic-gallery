import type { JSX } from 'react';
import { cn } from '@/lib/utils';

// Scryfall names a set's icon file after the set the icon was drawn for, not after
// every set that reuses it, so a set code alone does not reach the file. This route
// looks the code up and redirects to whichever file that set really uses.
const SET_ICON_BASE_URL = '/api/set-icon';

// The colors the rarity symbol is printed in: black, silver, gold, and the orange-red
// of a mythic. Lightened here so they hold up on the dark background.
const RARITY_CLASSES: Record<string, string> = {
  common: 'border-rarity-common/40 text-rarity-common',
  uncommon: 'border-rarity-uncommon/40 text-rarity-uncommon',
  rare: 'border-rarity-rare/50 text-rarity-rare',
  mythic: 'border-rarity-mythic/50 text-rarity-mythic',
};

const RARITY_DOT_CLASSES: Record<string, string> = {
  common: 'bg-rarity-common',
  uncommon: 'bg-rarity-uncommon',
  rare: 'bg-rarity-rare',
  mythic: 'bg-rarity-mythic',
};

// The shape of a Scryfall card image, which is 488x680. Holding the same ratio here
// means the art is never cropped and a card never changes size as it loads. It also
// leaves no letterbox, so the rounded corners of `card-frame` land on the edge of the
// art and cut the white corners off it.
export const CARD_IMAGE_CLASSES = 'relative w-full aspect-[61/85] bg-ink-900 overflow-hidden';

export function SetIcon({ setCode, className }: { setCode: string; className?: string }): JSX.Element {
  return (
    // Same as the mana symbols: an SVG that next/image will not optimize. This one also
    // arrives through a redirect, which its loader would have to follow for no gain.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${SET_ICON_BASE_URL}/${encodeURIComponent(setCode.toLowerCase())}`}
      alt=""
      aria-hidden="true"
      // The set picker lists every paper set, so an eager icon there is a thousand
      // redirects for the twelve rows a person can see. An icon already on screen
      // still loads at once.
      loading="lazy"
      // Set icons are solid black, which is invisible here, so invert them to read
      // as light on the dark background.
      className={cn('inline-block h-[1em] w-[1em] shrink-0 invert opacity-75', className)}
    />
  );
}

export function RarityBadge({ rarity, className }: { rarity: string; className?: string }): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium capitalize',
        RARITY_CLASSES[rarity] ?? 'border-ink-600 text-ink-400',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full', RARITY_DOT_CLASSES[rarity] ?? 'bg-ink-500')}
      />
      {rarity}
    </span>
  );
}

export function VariantBadge({ label, className }: { label: string; className?: string }): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-ink-750 px-2 py-0.5 text-[0.6875rem] text-ink-300',
        className
      )}
    >
      {label}
    </span>
  );
}

// Scryfall sends a plain decimal string, so a four figure card arrives as "1234.56".
// Group it, because a price is read at a glance and unbroken digits are not.
export function formatPrice(
  amount: string | null | undefined,
  currency: '$' | '€' = '$'
): string | null {
  if (!amount) {
    return null;
  }

  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) {
    return `${currency}${amount}`;
  }

  return `${currency}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
