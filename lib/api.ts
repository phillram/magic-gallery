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
    return data.data
      .filter((set: any) => set.released_at && !set.digital)
      .sort((a: any, b: any) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime());
  } catch (error) {
    console.error('Error fetching sets:', error);
    return [];
  }
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
