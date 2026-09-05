import { DEFAULT_SORT, SORT_OPTIONS, type SortKey } from './api';
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

// The sort is part of what someone set up before they shared the link, so it travels
// with the filters rather than resetting to the default on the other end.
const SORT_KEY = 'sort';

export function sortFromParams(params: URLSearchParams): SortKey {
  const raw = params.get(SORT_KEY);
  return SORT_OPTIONS.some((option) => option.key === raw) ? (raw as SortKey) : DEFAULT_SORT;
}

// Where the visitor was browsing when they opened a card. Card and version links carry
// it so "back to results" lands on the same filters, sort, and search. Without it the
// only way back to a long-built search was the browser's own back button.
export const FROM_KEY = 'from';

export function cardHref(cardId: string, from?: string): string {
  const suffix = from ? `?${FROM_KEY}=${encodeURIComponent(from)}` : '';
  return `/card/${cardId}${suffix}`;
}

export function versionsHref(cardId: string, from?: string): string {
  const suffix = from ? `?${FROM_KEY}=${encodeURIComponent(from)}` : '';
  return `/card/${cardId}/versions${suffix}`;
}

export function browseHref(from?: string): string {
  return from ? `/?${from}` : '/';
}

// The value arrives from a URL anyone can type, so keep only what the browser itself
// writes: the filter keys, in the shape the browser writes them.
export function sanitizeFrom(value: string | string[] | undefined): string | undefined {
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }

  const allowed = new Set<string>([...Object.values(KEYS), SORT_KEY]);
  const kept = new URLSearchParams();

  for (const [key, entry] of new URLSearchParams(value)) {
    if (allowed.has(key)) {
      kept.set(key, entry);
    }
  }

  const query = kept.toString();
  return query === '' ? undefined : query;
}

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

// A hand-typed "?q=%20%20" is the same nothing as no q at all. Carried through, it
// counts as a filter and draws a chip with no word in it. A term with any other
// character keeps its spaces, because they are part of what was searched for.
function readSearch(params: URLSearchParams): string {
  const raw = params.get(KEYS.search) ?? '';
  return raw.trim() === '' ? '' : raw;
}

export function filtersFromParams(params: URLSearchParams): FilterOptions {
  return {
    search: readSearch(params),
    sets: readList(params, KEYS.sets),
    colors: readList(params, KEYS.colors),
    types: readList(params, KEYS.types),
    rarities: readList(params, KEYS.rarities),
    exactMana: readNumber(params, KEYS.exactMana),
    minMana: readNumber(params, KEYS.minMana),
    maxMana: readNumber(params, KEYS.maxMana),
  };
}

export function paramsFromFilters(filters: FilterOptions, sort?: SortKey): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set(KEYS.search, filters.search);
  if (filters.sets.length) params.set(KEYS.sets, filters.sets.join(','));
  if (filters.colors.length) params.set(KEYS.colors, filters.colors.join(','));
  if (filters.types.length) params.set(KEYS.types, filters.types.join(','));
  if (filters.rarities.length) params.set(KEYS.rarities, filters.rarities.join(','));
  if (filters.exactMana !== null) params.set(KEYS.exactMana, String(filters.exactMana));
  if (filters.minMana !== null) params.set(KEYS.minMana, String(filters.minMana));
  if (filters.maxMana !== null) params.set(KEYS.maxMana, String(filters.maxMana));
  if (sort && sort !== DEFAULT_SORT) params.set(SORT_KEY, sort);

  return params;
}
