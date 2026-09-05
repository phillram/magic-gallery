'use client';

import React, { useState } from 'react';
import { FilterOptions } from '@/lib/types';
import { cn } from '@/lib/utils';
import { countActiveFilters } from '@/lib/analytics';
import { EMPTY_FILTERS } from '@/lib/filter-params';
import { ManaSymbol } from './ManaSymbols';
import SetPicker from './SetPicker';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions, options?: { replace?: boolean }) => void;
  sets: Array<{ code: string; name: string }>;
}

const CARD_TYPES = ['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Land', 'Planeswalker'];
const COLORS = ['W', 'U', 'B', 'R', 'G'];
const RARITIES = ['common', 'uncommon', 'rare', 'mythic'];
const COLOR_NAMES: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

// No control here locks while the results load. A field that disables itself on the
// first letter drops the focus and ends the entry after one character, so the results
// area carries the loading state instead.
export default function FilterSidebar({ filters, onFilterChange, sets }: FilterSidebarProps) {
  // Only the mode is the sidebar's own business. A link that arrives with a range
  // already set should open showing the range inputs.
  const [manaMode, setManaMode] = useState<'exact' | 'range'>(
    filters.minMana !== null || filters.maxMana !== null ? 'range' : 'exact'
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value }, { replace: true });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    const newFilters = { ...filters, colors: newColors };
    onFilterChange(newFilters);
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    const newFilters = { ...filters, types: newTypes };
    onFilterChange(newFilters);
  };

  const handleRarityToggle = (rarity: string) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter(r => r !== rarity)
      : [...filters.rarities, rarity];
    const newFilters = { ...filters, rarities: newRarities };
    onFilterChange(newFilters);
  };

  const handleManaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    const newFilters = { ...filters, exactMana: value };
    onFilterChange(newFilters);
  };

  const handleManaRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : null;
    const newFilters = {
      ...filters,
      [type === 'min' ? 'minMana' : 'maxMana']: numValue,
    };
    onFilterChange(newFilters);
  };

  // Each mode owns its own fields, and the query builder prefers an exact value over
  // a range. Leaving the old mode's values behind made the newly shown inputs do
  // nothing, so drop them when the mode changes.
  const handleManaModeChange = (mode: 'exact' | 'range') => {
    setManaMode(mode);

    const newFilters =
      mode === 'exact'
        ? { ...filters, minMana: null, maxMana: null }
        : { ...filters, exactMana: null };

    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = EMPTY_FILTERS;
    setManaMode('exact');
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-100">Filters</h2>
        <button
          onClick={clearFilters}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Search Cards</h3>
        <input
          type="text"
          placeholder="Card name..."
          value={filters.search}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Sets */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Sets</h3>
        <SetPicker
          sets={sets}
          selected={filters.sets}
          onToggle={(code) => {
            const newSets = filters.sets.includes(code)
              ? filters.sets.filter((s) => s !== code)
              : [...filters.sets, code];
            const newFilters = { ...filters, sets: newSets };
            onFilterChange(newFilters);
          }}
        />
      </div>

      {/* Mana Colors */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Mana Colors</h3>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              title={COLOR_NAMES[color]}
              aria-label={COLOR_NAMES[color]}
              aria-pressed={filters.colors.includes(color)}
              className={cn(
                'flex items-center justify-center rounded p-1 transition-all',
                filters.colors.includes(color)
                  ? 'bg-slate-700 ring-2 ring-white opacity-100'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <ManaSymbol symbol={`{${color}}`} className="h-7 w-7" />
            </button>
          ))}
        </div>
      </div>

      {/* Card Types */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Card Types</h3>
        <div className="space-y-2">
          {CARD_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="w-4 h-4 rounded bg-slate-800 border border-slate-700 checked:bg-blue-600"
              />
              <span className="text-sm text-slate-200">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Rarity</h3>
        <div className="space-y-2">
          {RARITIES.map((rarity) => (
            <label key={rarity} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.rarities.includes(rarity)}
                onChange={() => handleRarityToggle(rarity)}
                className="w-4 h-4 rounded bg-slate-800 border border-slate-700 checked:bg-blue-600"
              />
              <span className="text-sm text-slate-200 capitalize">{rarity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mana Value */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Mana Value</h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleManaModeChange('exact')}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded transition-colors',
              manaMode === 'exact'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
          >
            Exact
          </button>
          <button
            onClick={() => handleManaModeChange('range')}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded transition-colors',
              manaMode === 'range'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
          >
            Range
          </button>
        </div>

        {manaMode === 'exact' ? (
          <input
            type="number"
            min="0"
            max="20"
            placeholder="Mana value..."
            value={filters.exactMana ?? ''}
            onChange={handleManaChange}
            className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none"
          />
        ) : (
          <div className="space-y-2">
            <input
              type="number"
              min="0"
              max="20"
              placeholder="Min mana..."
              value={filters.minMana ?? ''}
              onChange={(e) => handleManaRangeChange('min', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              min="0"
              max="20"
              placeholder="Max mana..."
              value={filters.maxMana ?? ''}
              onChange={(e) => handleManaRangeChange('max', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
