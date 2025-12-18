import { Card, Set, FilterOptions } from './types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

export async function fetchSets(): Promise<Set[]> {
  try {
    const response = await fetch(`${SCRYFALL_API_BASE}/sets`);
    const data = await response.json();
    return data.data
      .filter((set: any) => set.released_at && !set.digital)
      .sort((a: any, b: any) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime());
  } catch (error) {
    console.error('Error fetching sets:', error);
    return [];
  }
}

export async function searchCards(filters: FilterOptions, page: number = 1): Promise<{ cards: Card[]; total: number }> {
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

    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}&order=released&dir=desc&page=${page}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { cards: [], total: 0 };
      }
      throw new Error('API Error');
    }

    const data = await response.json();
    return {
      cards: data.data || [],
      total: data.total_cards || 0,
    };
  } catch (error) {
    console.error('Error searching cards:', error);
    return { cards: [], total: 0 };
  }
}

export async function fetchCardById(id: string): Promise<Card | null> {
  try {
    const response = await fetch(`${SCRYFALL_API_BASE}/cards/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching card:', error);
    return null;
  }
}

export async function fetchRandomCard(): Promise<Card | null> {
  try {
    const response = await fetch(`${SCRYFALL_API_BASE}/cards/random?q=game:paper`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching random card:', error);
    return null;
  }
}

export function getManaSymbol(mana: string): string {
  const symbols: { [key: string]: string } = {
    W: '⭕',
    U: '🔵',
    B: '⚫',
    R: '🔴',
    G: '🟢',
    X: '❌',
    0: '0️⃣',
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣',
  };
  return symbols[mana] || mana;
}

export function getExternalLinks(card: Card): Record<string, string> {
  const cardName = encodeURIComponent(card.name);
  const setCode = card.set.toUpperCase();

  return {
    Scryfall: card.scryfall_uri,
    Gatherer: `https://gatherer.wizards.com/Pages/Card/Details.aspx?name=${cardName}`,
    TCGPlayer: `https://www.tcgplayer.com/search/all/product?productLineName=magic&q=${cardName}`,
    EDHREC: `https://edhrec.com/cards/${card.name.toLowerCase().replace(/ /g, '-')}`,
    Archidekt: `https://archidekt.com/cards/${card.id}`,
  };
}
