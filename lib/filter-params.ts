import { FilterOptions } from './types';

export const EMPTY_FILTERS: FilterOptions = {
  search: '',
  sets: [],
  colors: [],
  types: [],
  rarities: [],
  minMana: null,
  maxMana: null,
  exactMana: null,
};

// Short keys, because these end up in a link someone pastes to a friend.
const KEYS = {
  search: 'q',
  sets: 'set',
  colors: 'color',
  types: 'type',
  rarities: 'rarity',
  exactMana: 'cmc',
  minMana: 'cmcmin',
  maxMana: 'cmcmax',
} as const;

function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  return raw ? raw.split(',').filter(Boolean) : [];
}

function readNumber(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw === null || raw.trim() === '') {
    return null;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) ? null : value;
}

export function filtersFromParams(params: URLSearchParams): FilterOptions {
  return {
    search: params.get(KEYS.search) ?? '',
    sets: readList(params, KEYS.sets),
    colors: readList(params, KEYS.colors),
    types: readList(params, KEYS.types),
    rarities: readList(params, KEYS.rarities),
    exactMana: readNumber(params, KEYS.exactMana),
    minMana: readNumber(params, KEYS.minMana),
    maxMana: readNumber(params, KEYS.maxMana),
  };
}

export function paramsFromFilters(filters: FilterOptions): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set(KEYS.search, filters.search);
  if (filters.sets.length) params.set(KEYS.sets, filters.sets.join(','));
  if (filters.colors.length) params.set(KEYS.colors, filters.colors.join(','));
  if (filters.types.length) params.set(KEYS.types, filters.types.join(','));
  if (filters.rarities.length) params.set(KEYS.rarities, filters.rarities.join(','));
  if (filters.exactMana !== null) params.set(KEYS.exactMana, String(filters.exactMana));
  if (filters.minMana !== null) params.set(KEYS.minMana, String(filters.minMana));
  if (filters.maxMana !== null) params.set(KEYS.maxMana, String(filters.maxMana));

  return params;
}
