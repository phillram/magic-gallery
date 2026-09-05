import { Card, Set, FilterOptions } from './types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

// Scryfall sorts server side, so every option here is one it already supports.
export const SORT_OPTIONS = [
  { key: 'released_desc', label: 'Newest first', order: 'released', dir: 'desc' },
  { key: 'released_asc', label: 'Oldest first', order: 'released', dir: 'asc' },
  { key: 'name_asc', label: 'Name, A to Z', order: 'name', dir: 'asc' },
  { key: 'cmc_asc', label: 'Mana value, low to high', order: 'cmc', dir: 'asc' },
  { key: 'cmc_desc', label: 'Mana value, high to low', order: 'cmc', dir: 'desc' },
  { key: 'rarity_desc', label: 'Rarity, high to low', order: 'rarity', dir: 'desc' },
  { key: 'usd_desc', label: 'Price, high to low', order: 'usd', dir: 'desc' },
  { key: 'edhrec_asc', label: 'Most played in Commander', order: 'edhrec', dir: 'asc' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['key'];

export const DEFAULT_SORT: SortKey = 'released_desc';

// Scryfall rejects requests that send an HTTP library's default User-Agent, which is
// what server-side rendering does. Browsers drop the User-Agent header and send their
// own, so the same options work on both sides.
const SCRYFALL_HEADERS = {
  'User-Agent': 'MagicCardBrowser/1.0',
  Accept: 'application/json',
};

export async function fetchSets(): Promise<Set[]> {
  try {
    const response = await fetch(`${SCRYFALL_API_BASE}/sets`, { headers: SCRYFALL_HEADERS });
    const data = await response.json();
    return (data.data as Set[])
      .filter((set) => set.released_at && !set.digital)
      .sort((a, b) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime());
  } catch (error) {
    console.error('Error fetching sets:', error);
    return [];
  }
}

// Two thirds of sets name their icon file after something other than their own code:
// Theros Beyond Death Promos (pthb) uses thb.svg, Secret Lair Drop uses star.svg. A
// code cannot be guessed into a URL, and a guess that misses 404s into a broken image,
// so the set list is the only thing that says which file a set actually uses.
const SET_ICON_INDEX_TTL_MS = 24 * 60 * 60 * 1000;

// An index we failed to load is retried sooner, so an unreachable Scryfall costs one
// day of generic icons only if it stays unreachable for a day.
const SET_ICON_INDEX_RETRY_MS = 60 * 1000;

// Scryfall's own stand-in, for a set the index does not know and for the window where
// the index could not be loaded at all.
export const FALLBACK_SET_ICON_URL = 'https://svgs.scryfall.io/sets/default.svg';

type SetIconIndex = { urls: Map<string, string>; expiresAt: number };

let setIconIndex: SetIconIndex | null = null;
let setIconIndexRequest: Promise<SetIconIndex> | null = null;

async function loadSetIconIndex(): Promise<SetIconIndex> {
  try {
    const response = await fetch(`${SCRYFALL_API_BASE}/sets`, {
      headers: SCRYFALL_HEADERS,
      next: { revalidate: SET_ICON_INDEX_TTL_MS / 1000 },
    });

    if (!response.ok) {
      throw new Error(`Scryfall set list failed with status ${response.status}`);
    }

    const data = await response.json();
    const urls = new Map<string, string>();

    for (const set of data.data ?? []) {
      if (set.code && set.icon_svg_uri) {
        urls.set(String(set.code).toLowerCase(), set.icon_svg_uri);
      }
    }

    return { urls, expiresAt: Date.now() + SET_ICON_INDEX_TTL_MS };
  } catch (error) {
    console.error('Error fetching set icons:', error);
    return { urls: new Map(), expiresAt: Date.now() + SET_ICON_INDEX_RETRY_MS };
  }
}

// One set list answers every icon on a page, so callers that arrive together share a
// single request rather than each asking Scryfall for the same 1000 sets.
export async function fetchSetIconUrl(setCode: string): Promise<string> {
  if (!setIconIndex || setIconIndex.expiresAt <= Date.now()) {
    setIconIndexRequest ??= loadSetIconIndex();
    setIconIndex = await setIconIndexRequest;
    setIconIndexRequest = null;
  }

  return setIconIndex.urls.get(setCode.toLowerCase()) ?? FALLBACK_SET_ICON_URL;
}

export async function searchCards(
  filters: FilterOptions,
  page: number = 1,
  sort: SortKey = DEFAULT_SORT
): Promise<{ cards: Card[]; total: number; hasMore: boolean }> {
  try {
    let query = 'game:paper ';

    // Build search query
    const queryParts: string[] = [];

    if (filters.search) {
      queryParts.push(`name:"${filters.search}"`);
    }

    if (filters.sets.length > 0) {
      queryParts.push(`(${filters.sets.map(s => `set:${s}`).join(' OR ')})`);
    }

    if (filters.colors.length > 0) {
      const colorQuery = filters.colors.map(c => `c:${c}`).join(' OR ');
      queryParts.push(`(${colorQuery})`);
    }

    if (filters.types.length > 0) {
      const typeQuery = filters.types.map(t => `t:${t}`).join(' OR ');
      queryParts.push(`(${typeQuery})`);
    }

    if (filters.rarities.length > 0) {
      const rarityQuery = filters.rarities.map(r => `r:${r}`).join(' OR ');
      queryParts.push(`(${rarityQuery})`);
    }

    if (filters.exactMana !== null) {
      queryParts.push(`cmc:${filters.exactMana}`);
    } else if (filters.minMana !== null || filters.maxMana !== null) {
      if (filters.minMana !== null && filters.maxMana !== null) {
        queryParts.push(`cmc>=${filters.minMana} cmc<=${filters.maxMana}`);
      } else if (filters.minMana !== null) {
        queryParts.push(`cmc>=${filters.minMana}`);
      } else if (filters.maxMana !== null) {
        queryParts.push(`cmc<=${filters.maxMana}`);
      }
    }

    if (queryParts.length === 0) {
      queryParts.push('');
    }

    query += queryParts.join(' ');

    const { order, dir } = SORT_OPTIONS.find((option) => option.key === sort) ?? SORT_OPTIONS[0];

    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}&order=${order}&dir=${dir}&page=${page}`,
      { headers: SCRYFALL_HEADERS }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { cards: [], total: 0, hasMore: false };
      }
      throw new Error(`Scryfall search failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      cards: data.data || [],
      total: data.total_cards || 0,
      // Scryfall decides the page size and says whether another page exists, so trust
      // it rather than inferring from how many cards came back.
      hasMore: Boolean(data.has_more),
    };
  } catch (error) {
    console.error('Error searching cards:', error);
    return { cards: [], total: 0, hasMore: false };
  }
}

// Every printing of a card shares one oracle id, so that is what gathers a card's
// other versions. Reversible cards carry no oracle id, and an exact name match is the
// closest stand-in there. The game:paper filter matches the browser on the home page,
// so the gallery never offers a printing the rest of the app refuses to show.
function printsQuery(card: Card): string {
  const identity = card.oracle_id ? `oracleid:${card.oracle_id}` : `!"${card.name}"`;
  return `${identity} game:paper`;
}

// Scryfall can collapse a card's printings down to one per piece of art, which drops
// the reprints that only repeat art already on screen, and with them the sets that hold
// nothing else. It keeps the oldest printing of an art rather than the newest.
export type PrintsUnique = 'prints' | 'art';

// Most reprints reuse art, so the arts are the shorter and more interesting answer to
// "what does this card look like?" and are what the gallery opens on.
export const DEFAULT_PRINTS_UNIQUE: PrintsUnique = 'art';

export async function fetchCardPrints(
  card: Card,
  page: number = 1,
  unique: PrintsUnique = DEFAULT_PRINTS_UNIQUE
): Promise<{ cards: Card[]; total: number; hasMore: boolean }> {
  try {
    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(printsQuery(card))}` +
        `&unique=${unique}&order=released&dir=desc&page=${page}`,
      { headers: SCRYFALL_HEADERS }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { cards: [], total: 0, hasMore: false };
      }
      throw new Error(`Scryfall prints search failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      cards: data.data || [],
      total: data.total_cards || 0,
      hasMore: Boolean(data.has_more),
    };
  } catch (error) {
    console.error('Error fetching card prints:', error);
    return { cards: [], total: 0, hasMore: false };
  }
}

// A card Scryfall does not have and a Scryfall request that was refused both leave us
// with no card to render, but only one of them is the visitor's fault. Telling them
// apart is what stops a broken lookup from hiding behind the "Card Not Found" page.
export type CardLookup =
  | { card: Card }
  | { card: null; reason: 'not_found' }
  | { card: null; reason: 'error'; status: number | null; message: string };

export async function fetchCardById(id: string): Promise<CardLookup> {
  try {
    const response = await fetch(`${SCRYFALL_API_BASE}/cards/${id}`, { headers: SCRYFALL_HEADERS });

    if (response.status === 404) {
      return { card: null, reason: 'not_found' };
    }

    if (!response.ok) {
      const message = `Scryfall card lookup failed with status ${response.status}`;
      console.error(message);
      return { card: null, reason: 'error', status: response.status, message };
    }

    return { card: await response.json() };
  } catch (error) {
    console.error('Error fetching card:', error);
    return {
      card: null,
      reason: 'error',
      status: null,
      message: error instanceof Error ? error.message : 'Scryfall card lookup threw',
    };
  }
}

export async function fetchRandomCard(): Promise<Card | null> {
  try {
    const response = await fetch(`${SCRYFALL_API_BASE}/cards/random?q=game:paper`, {
      headers: SCRYFALL_HEADERS,
    });
    if (!response.ok) {
      const message = `Scryfall random card failed with status ${response.status}`;
      console.error(message);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching random card:', error);
    return null;
  }
}

export function getExternalLinks(card: Card): Record<string, string> {
  const cardName = encodeURIComponent(card.name);

  return {
    Scryfall: card.scryfall_uri,
    Gatherer: `https://gatherer.wizards.com/Pages/Card/Details.aspx?name=${cardName}`,
    TCGPlayer: `https://www.tcgplayer.com/search/all/product?productLineName=magic&q=${cardName}`,
    EDHREC: `https://edhrec.com/cards/${card.name.toLowerCase().replace(/ /g, '-')}`,
    Archidekt: `https://archidekt.com/cards/${card.id}`,
  };
}
