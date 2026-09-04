'use client';

import { FilterOptions } from '@/lib/types';
import { countActiveFilters } from '@/lib/analytics';
import { ManaSymbol } from './ManaSymbols';

interface ActiveFiltersProps {
  filters: FilterOptions;
  setNames: Record<string, string>;
  onFilterChange: (filters: FilterOptions) => void;
}

interface Chip {
  key: string;
  label: string;
  symbol?: string;
  remove: (filters: FilterOptions) => FilterOptions;
}

const COLOR_NAMES: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

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
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => {
            const next = chip.remove(filters);
            onFilterChange(next);
          }}
          aria-label={`Remove filter ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-200 hover:border-slate-500 hover:text-white"
        >
          {chip.symbol && <ManaSymbol symbol={chip.symbol} />}
          <span className="capitalize">{chip.label}</span>
          <span aria-hidden="true" className="text-slate-400">
            ×
          </span>
        </button>
      ))}
    </div>
  );
}
