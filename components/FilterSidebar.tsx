'use client';

import React, { useState } from 'react';
import { Card, FilterOptions } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
  sets: Array<{ code: string; name: string }>;
  isLoading: boolean;
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
const COLOR_CLASSES: Record<string, string> = {
  W: 'bg-yellow-100',
  U: 'bg-blue-400',
  B: 'bg-gray-800',
  R: 'bg-red-500',
  G: 'bg-green-600',
};

export default function FilterSidebar({ onFilterChange, sets, isLoading }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sets: [],
    colors: [],
    types: [],
    rarities: [],
    minMana: null,
    maxMana: null,
    exactMana: null,
  });

  const [manaMode, setManaMode] = useState<'exact' | 'range'>('exact');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSetToggle = (setCode: string) => {
    const newSets = filters.sets.includes(setCode)
      ? filters.sets.filter(s => s !== setCode)
      : [...filters.sets, setCode];
    const newFilters = { ...filters, sets: newSets };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    const newFilters = { ...filters, colors: newColors };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    const newFilters = { ...filters, types: newTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRarityToggle = (rarity: string) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter(r => r !== rarity)
      : [...filters.rarities, rarity];
    const newFilters = { ...filters, rarities: newRarities };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleManaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    const newFilters = { ...filters, exactMana: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleManaRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : null;
    const newFilters = {
      ...filters,
      [type === 'min' ? 'minMana' : 'maxMana']: numValue,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      search: '',
      sets: [],
      colors: [],
      types: [],
      rarities: [],
      minMana: null,
      maxMana: null,
      exactMana: null,
    };
    setFilters(defaultFilters);
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
          disabled={isLoading}
          className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* Sets */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Sets</h3>
        <select
          value={filters.sets[0] || ''}
          onChange={(e) => {
            const newFilters = { ...filters, sets: e.target.value ? [e.target.value] : [] };
            setFilters(newFilters);
            onFilterChange(newFilters);
          }}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50"
        >
          <option value="">All Sets</option>
          {sets.map((set) => (
            <option key={set.code} value={set.code}>
              {set.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mana Colors */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Mana Colors</h3>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              disabled={isLoading}
              className={cn(
                'p-2 rounded transition-opacity text-sm font-bold text-white',
                filters.colors.includes(color) ? 'ring-2 ring-white opacity-100' : 'opacity-60 hover:opacity-80',
                COLOR_CLASSES[color],
                'disabled:opacity-50'
              )}
            >
              {color}
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
                disabled={isLoading}
                className="w-4 h-4 rounded bg-slate-800 border border-slate-700 checked:bg-blue-600 disabled:opacity-50"
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
                disabled={isLoading}
                className="w-4 h-4 rounded bg-slate-800 border border-slate-700 checked:bg-blue-600 disabled:opacity-50"
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
            onClick={() => setManaMode('exact')}
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
            onClick={() => setManaMode('range')}
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
            disabled={isLoading}
            className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <input
              type="number"
              min="0"
              max="20"
              placeholder="Max mana..."
              value={filters.maxMana ?? ''}
              onChange={(e) => handleManaRangeChange('max', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>
        )}
      </div>
    </div>
  );
}
