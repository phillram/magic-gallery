'use client';

import React, { useEffect, useRef, useState, type JSX } from 'react';
import { FilterOptions } from '@/lib/types';
import { cn } from '@/lib/utils';
import { EMPTY_FILTERS } from '@/lib/filter-params';
import { countActiveFilters } from '@/lib/analytics';
import { COLOR_NAMES, COLORS } from '@/lib/mtg';
import { SORT_OPTIONS, SortKey } from '@/lib/api';
import { ManaSymbol } from './ManaSymbols';
import { CheckboxRow, SegmentedControl } from './Controls';
import FilterMenu from './FilterMenu';
import SetPicker from './SetPicker';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions, options?: { replace?: boolean }) => void;
  sets: Array<{ code: string; name: string }>;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

const CARD_TYPES = [
  'Creature',
  'Instant',
  'Sorcery',
  'Enchantment',
  'Artifact',
  'Land',
  'Planeswalker',
  'Battle',
];
const RARITIES = ['common', 'uncommon', 'rare', 'mythic'];

// Most cards cost six or less, so the common answers are one click and the rest is
// still typable.
const QUICK_MANA_VALUES = [0, 1, 2, 3, 4, 5, 6];

// Gleemax costs sixteen and is the most expensive card printed on paper. The few above
// it are all in un-sets, so this leaves room and still rejects a typo.
const MAX_MANA_VALUE = 20;

function SearchIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13.2 13.2 17 17" />
    </svg>
  );
}

export default function FilterBar({
  filters,
  onFilterChange,
  sets,
  sort,
  onSortChange,
}: FilterBarProps): JSX.Element {
  // The mode follows the filters rather than being held apart from them, so a shared
  // link and a back step both open on the inputs that hold the values. Read once at
  // mount it went stale: the summary said "1–3" over an empty exact box.
  const [manaModePick, setManaModePick] = useState<'exact' | 'range' | null>(null);
  const hasRange = filters.minMana !== null || filters.maxMana !== null;
  const manaMode: 'exact' | 'range' = hasRange
    ? 'range'
    : filters.exactMana !== null
      ? 'exact'
      : // Neither field says anything, so the mode is whichever the visitor last asked
        // for, and Exact until they ask.
        (manaModePick ?? 'exact');

  // Searching by name is what most visits are, and the box is above a grid the visitor
  // has usually scrolled away from. "/" is what a search-first page is expected to
  // answer to, and it saves the scroll back up.
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      // A visitor already typing somewhere means the slash is theirs, not ours.
      const active = document.activeElement;
      const isTypingElsewhere =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active instanceof HTMLElement && active.isContentEditable);

      if (isTypingElsewhere) {
        return;
      }

      // Without this the slash lands in the box it just focused.
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleIn = (key: 'colors' | 'types' | 'rarities', value: string) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: next });
  };

  // Each mode owns its own fields, and the query builder prefers an exact value over
  // a range. Leaving the old mode's values behind made the newly shown inputs do
  // nothing, so drop them when the mode changes.
  const handleManaModeChange = (mode: 'exact' | 'range') => {
    setManaModePick(mode);
    onFilterChange(
      mode === 'exact'
        ? { ...filters, minMana: null, maxMana: null }
        : { ...filters, exactMana: null }
    );
  };

  // The min and max attributes only bind the spinner arrows, so a typed "-5" or "999"
  // reaches the query and comes back with nothing to show for it. No card costs more
  // than MAX_MANA_VALUE, so clamping keeps every entry on a value that can match.
  const readNumber = (value: string): number | null => {
    if (value === '') {
      return null;
    }
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return Math.min(Math.max(parsed, 0), MAX_MANA_VALUE);
  };

  const isRangeBackwards =
    filters.minMana !== null && filters.maxMana !== null && filters.minMana > filters.maxMana;

  const manaSummary =
    filters.exactMana !== null
      ? String(filters.exactMana)
      : filters.minMana !== null && filters.maxMana !== null
        ? `${filters.minMana}–${filters.maxMana}`
        : filters.minMana !== null
          ? `${filters.minMana}+`
          : filters.maxMana !== null
            ? `≤ ${filters.maxMana}`
            : undefined;

  return (
    // The open menus hang out of this box, so it sits above the results grid rather
    // than behind it.
    <div className="relative z-30 rounded-xl border border-ink-800 bg-ink-900/70 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Searching by name is what most visits start with, so it takes the width
            it needs and comes first in the reading order. */}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            type="search"
            value={filters.search}
            onChange={(event) =>
              onFilterChange({ ...filters, search: event.target.value }, { replace: true })
            }
            placeholder="Search card names, such as “lightning bolt”"
            aria-label="Search card names"
            aria-keyshortcuts="/"
            className="w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 pl-10 pr-11 text-ink-100 placeholder:text-ink-500 focus:border-gold-500"
          />
          {/* The shortcut is only worth having if it can be found, and it is in the
              way once the box holds a name. */}
          {!filters.search && (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-ink-700 bg-ink-900 px-1.5 py-0.5 font-sans text-xs text-ink-500 sm:block"
            >
              /
            </kbd>
          )}
        </div>

        <label className="flex shrink-0 items-center gap-2 text-sm text-ink-400">
          Sort by
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className="rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-gold-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FilterMenu label="Sets" count={filters.sets.length} width="w-80">
          <SetPicker
            sets={sets}
            selected={filters.sets}
            onToggle={(code) => {
              const next = filters.sets.includes(code)
                ? filters.sets.filter((entry) => entry !== code)
                : [...filters.sets, code];
              onFilterChange({ ...filters, sets: next });
            }}
          />
        </FilterMenu>

        <FilterMenu label="Colors" count={filters.colors.length} width="w-64">
          <div className="grid grid-cols-2 gap-1">
            {COLORS.map((color) => {
              const isOn = filters.colors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => toggleIn('colors', color)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isOn
                      ? 'bg-gold-500/15 text-gold-200 ring-1 ring-gold-500/50'
                      : 'text-ink-200 hover:bg-ink-750'
                  )}
                >
                  <ManaSymbol symbol={`{${color}}`} className="h-5 w-5" />
                  {COLOR_NAMES[color]}
                </button>
              );
            })}
          </div>
          <p className="mt-2 px-2 text-xs text-ink-500">
            A card matches if it has any of the colors you pick.
          </p>
        </FilterMenu>

        <FilterMenu label="Types" count={filters.types.length} width="w-56">
          <div className="space-y-0.5">
            {CARD_TYPES.map((type) => (
              <CheckboxRow
                key={type}
                label={type}
                checked={filters.types.includes(type)}
                onChange={() => toggleIn('types', type)}
              />
            ))}
          </div>
        </FilterMenu>

        <FilterMenu label="Rarity" count={filters.rarities.length} width="w-48">
          <div className="space-y-0.5">
            {RARITIES.map((rarity) => (
              <CheckboxRow
                key={rarity}
                label={<span className="capitalize">{rarity}</span>}
                checked={filters.rarities.includes(rarity)}
                onChange={() => toggleIn('rarities', rarity)}
              />
            ))}
          </div>
        </FilterMenu>

        <FilterMenu label="Mana value" summary={manaSummary} width="w-72">
          <SegmentedControl
            label="Mana value mode"
            className="w-full"
            options={[
              { value: 'exact', label: 'Exact' },
              { value: 'range', label: 'Range' },
            ]}
            value={manaMode}
            onChange={handleManaModeChange}
          />

          {manaMode === 'exact' ? (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_MANA_VALUES.map((value) => {
                  const isOn = filters.exactMana === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isOn}
                      // Clicking the value that is already on removes the filter, so
                      // the same button both sets and clears it.
                      onClick={() =>
                        onFilterChange({ ...filters, exactMana: isOn ? null : value })
                      }
                      className={cn(
                        'h-8 w-8 rounded-full text-sm font-medium transition-colors',
                        isOn
                          ? 'bg-gold-400 text-ink-950'
                          : 'bg-ink-800 text-ink-200 hover:bg-ink-750'
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
              <label className="mt-3 block text-xs text-ink-400">
                Or type a value
                <input
                  type="number"
                  min="0"
                  max={MAX_MANA_VALUE}
                  value={filters.exactMana ?? ''}
                  onChange={(event) =>
                    onFilterChange({ ...filters, exactMana: readNumber(event.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-gold-500"
                />
              </label>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs text-ink-400">
                From
                <input
                  type="number"
                  min="0"
                  max={MAX_MANA_VALUE}
                  value={filters.minMana ?? ''}
                  onChange={(event) =>
                    onFilterChange({ ...filters, minMana: readNumber(event.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-gold-500"
                />
              </label>
              <label className="text-xs text-ink-400">
                To
                <input
                  type="number"
                  min="0"
                  max={MAX_MANA_VALUE}
                  value={filters.maxMana ?? ''}
                  onChange={(event) =>
                    onFilterChange({ ...filters, maxMana: readNumber(event.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-gold-500"
                />
              </label>

              {/* A backwards range matches nothing, and the empty grid alone does not
                  say which of the filters emptied it. */}
              {isRangeBackwards && (
                <p role="status" className="col-span-2 text-xs text-rarity-mythic">
                  No card can cost that. Make “From” the smaller number.
                </p>
              )}
            </div>
          )}
        </FilterMenu>

        <button
          type="button"
          disabled={countActiveFilters(filters) === 0}
          onClick={() => {
            setManaModePick(null);
            onFilterChange(EMPTY_FILTERS);
          }}
          className="ml-auto rounded-md px-3 py-2 text-sm text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100 disabled:cursor-not-allowed disabled:text-ink-600 disabled:hover:bg-transparent"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
