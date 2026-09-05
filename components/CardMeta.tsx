import type { JSX } from 'react';
import { cn } from '@/lib/utils';

// Scryfall names a set's icon file after the set the icon was drawn for, not after
// every set that reuses it, so a set code alone does not reach the file. This route
// looks the code up and redirects to whichever file that set really uses.
const SET_ICON_BASE_URL = '/api/set-icon';

// Magic's own rarity colors: black, silver, gold, and the orange-red of mythics.
// Lightened here so they hold up on the dark background.
const RARITY_CLASSES: Record<string, string> = {
  common: 'border-slate-500 text-slate-300',
  uncommon: 'border-slate-300 text-slate-200',
  rare: 'border-amber-400 text-amber-300',
  mythic: 'border-orange-500 text-orange-400',
};

// Magic cards are 63x88mm, and Scryfall's images keep that shape. Holding the same
// ratio here means the art is never cropped and a card never changes size as it loads.
export const CARD_IMAGE_CLASSES = 'relative w-full aspect-5/7 bg-slate-900 overflow-hidden';

export function SetIcon({ setCode, className }: { setCode: string; className?: string }): JSX.Element {
  return (
    <img
      src={`${SET_ICON_BASE_URL}/${encodeURIComponent(setCode.toLowerCase())}`}
      alt=""
      aria-hidden="true"
      // Set icons are solid black, which is invisible here, so invert them to read
      // as light on the dark background.
      className={cn('inline-block h-[1em] w-[1em] invert opacity-70', className)}
    />
  );
}

export function RarityBadge({ rarity, className }: { rarity: string; className?: string }): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs capitalize',
        RARITY_CLASSES[rarity] ?? 'border-slate-600 text-slate-400',
        className
      )}
    >
      {rarity}
    </span>
  );
}

export function VariantBadge({ label, className }: { label: string; className?: string }): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300',
        className
      )}
    >
      {label}
    </span>
  );
}

export function formatPrice(amount: string | null | undefined, currency: '$' | '€' = '$'): string | null {
  return amount ? `${currency}${amount}` : null;
}
