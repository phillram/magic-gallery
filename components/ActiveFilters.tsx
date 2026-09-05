'use client';

import type { JSX } from 'react';
import { FilterOptions } from '@/lib/types';
import { COLOR_NAMES } from '@/lib/mtg';
import { cn } from '@/lib/utils';
import { ManaSymbol } from './ManaSymbols';
import { SetIcon } from './CardMeta';

interface ActiveFiltersProps {
  filters: FilterOptions;
  setNames: Record<string, string>;
  onFilterChange: (filters: FilterOptions) => void;
}

interface Chip {
  key: string;
  label: string;
  symbol?: string;
  setCode?: string;
  // Scryfall sends the rarity in lower case. Nothing else on a chip does, and the text
  // a visitor typed must stay the way they typed it.
  capitalize?: boolean;
  remove: (filters: FilterOptions) => FilterOptions;
}

function buildChips(filters: FilterOptions, setNames: Record<string, string>): Chip[] {
  const chips: Chip[] = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `“${filters.search}”`,
      remove: (current) => ({ ...current, search: '' }),
    });
  }

  filters.sets.forEach((code) => {
    chips.push({
      key: `set:${code}`,
      label: setNames[code] ?? code.toUpperCase(),
      setCode: code,
      remove: (current) => ({ ...current, sets: current.sets.filter((s) => s !== code) }),
    });
  });

  filters.colors.forEach((color) => {
    chips.push({
      key: `color:${color}`,
      label: COLOR_NAMES[color] ?? color,
      symbol: `{${color}}`,
      remove: (current) => ({ ...current, colors: current.colors.filter((c) => c !== color) }),
    });
  });

  filters.types.forEach((type) => {
    chips.push({
      key: `type:${type}`,
      label: type,
      remove: (current) => ({ ...current, types: current.types.filter((t) => t !== type) }),
    });
  });

  filters.rarities.forEach((rarity) => {
    chips.push({
      key: `rarity:${rarity}`,
      label: rarity,
      capitalize: true,
      remove: (current) => ({ ...current, rarities: current.rarities.filter((r) => r !== rarity) }),
    });
  });

  if (filters.exactMana !== null) {
    chips.push({
      key: 'cmc',
      label: `Mana value ${filters.exactMana}`,
      remove: (current) => ({ ...current, exactMana: null }),
    });
  }

  if (filters.minMana !== null) {
    chips.push({
      key: 'cmcmin',
      label: `Mana value ${filters.minMana} or more`,
      remove: (current) => ({ ...current, minMana: null }),
    });
  }

  if (filters.maxMana !== null) {
    chips.push({
      key: 'cmcmax',
      label: `Mana value ${filters.maxMana} or less`,
      remove: (current) => ({ ...current, maxMana: null }),
    });
  }

  return chips;
}

export default function ActiveFilters({
  filters,
  setNames,
  onFilterChange,
}: ActiveFiltersProps): JSX.Element | null {
  const chips = buildChips(filters, setNames);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => {
            const next = chip.remove(filters);
            onFilterChange(next);
          }}
          aria-label={`Remove filter ${chip.label}`}
          className="group inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 py-1 pl-2.5 pr-2 text-sm text-ink-200 transition-colors hover:border-gold-500/60 hover:bg-ink-800 hover:text-ink-100"
        >
          {chip.symbol && <ManaSymbol symbol={chip.symbol} />}
          {chip.setCode && <SetIcon setCode={chip.setCode} />}
          <span className={cn(chip.capitalize && 'capitalize')}>{chip.label}</span>
          <span
            aria-hidden="true"
            className="text-base leading-none text-ink-500 transition-colors group-hover:text-gold-300"
          >
            ×
          </span>
        </button>
      ))}
    </div>
  );
}
