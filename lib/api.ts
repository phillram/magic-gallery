import { nameTerms } from './search-query';
import { Card, Set, SetOption, FilterOptions } from './types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

// Scryfall sorts server side, so every option here is one it already supports.
export const SORT_OPTIONS = [
  { key: 'edhrec_asc', label: 'Most played in Commander', order: 'edhrec', dir: 'asc' },
  { key: 'released_desc', label: 'Newest first', order: 'released', dir: 'desc' },
  { key: 'released_asc', label: 'Oldest first', order: 'released', dir: 'asc' },
  { key: 'name_asc', label: 'Name, A to Z', order: 'name', dir: 'asc' },
  { key: 'cmc_asc', label: 'Mana value, low to high', order: 'cmc', dir: 'asc' },
  { key: 'cmc_desc', label: 'Mana value, high to low', order: 'cmc', dir: 'desc' },
  { key: 'rarity_desc', label: 'Rarity, high to low', order: 'rarity', dir: 'desc' },
  { key: 'usd_desc', label: 'Price, high to low', order: 'usd', dir: 'desc' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['key'];

// How often a card is played in Commander, which is the closest thing Scryfall holds to
// "cards a player knows". The newest set came first before this, so a first visit opened
// on the five basic lands of whatever had just come out. It reads as relevance on a name
// search too: "bolt" now opens on Lightning Bolt rather than on the newest card with
// bolt in its name.
export const DEFAULT_SORT: SortKey = 'edhrec_asc';

// Scryfall rejects requests that send an HTTP library's default User-Agent, which is
// what server-side rendering does. Browsers drop the User-Agent header and send their
// own, so the same options work on both sides.
const SCRYFALL_HEADERS = {
  'User-Agent': 'MagicCardBrowser/1.0',
  Accept: 'application/json',
};

// Scryfall answers /sets with every field it holds on all thousand of them, which is
// most of a megabyte. Both the picker and the icon index want a few bytes of that, so
// the list is read once on the server and each side takes the part it needs.
export const SET_LIST_TTL_SECONDS = 24 * 60 * 60;

// Server side only: the raw set list, held by Next for a day so a thousand visitors
// cost Scryfall one request rather than a thousand.
async function loadScryfallSets(): Promise<Set[]> {
  const response = await fetch(`${SCRYFALL_API_BASE}/sets`, {
    headers: SCRYFALL_HEADERS,
    next: { revalidate: SET_LIST_TTL_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Scryfall set list failed with status ${response.status}`);
  }

  const data = await response.json();
  return (data.data ?? []) as Set[];
}

// What the set picker and the filter chips need, and nothing else. Newest first, and
// digital-only sets left out, because the app shows paper cards.
export async function fetchSetOptions(): Promise<SetOption[]> {
  const sets = await loadScryfallSets();
  return sets
    .filter((set) => set.released_at && !set.digital)
    .sort((a, b) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime())
    .map((set) => ({ code: set.code, name: set.name }));
}

// The browser reads the short list from this app, not the long one from Scryfall. It
// is a fraction of the bytes, and it carries a cache header, so coming back to the
// browser costs nothing at all.
export async function fetchSets(): Promise<SetOption[]> {
  try {
    const response = await fetch('/api/sets');
    if (!response.ok) {
      throw new Error(`Set list failed with status ${response.status}`);
    }
    return (await response.json()) as SetOption[];
  } catch (error) {
    console.error('Error fetching sets:', error);
    return [];
  }
}

// Two thirds of sets name their icon file after something other than their own code:
// Theros Beyond Death Promos (pthb) uses thb.svg, Secret Lair Drop uses star.svg. A
// code cannot be guessed into a URL, and a guess that misses 404s into a broken image,
// so the set list is the only thing that says which file a set actually uses.
const SET_ICON_INDEX_TTL_MS = SET_LIST_TTL_SECONDS * 1000;

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
    const urls = new Map<string, string>();

    for (const set of await loadScryfallSets()) {
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

// A search that matched nothing and a search that never reached Scryfall both come
// back with no cards. Only one of them means "no card matches this", so the flag is
// what stops an outage from being reported to the visitor as an empty shelf.
export type SearchResult = {
  cards: Card[];
  total: number;
  hasMore: boolean;
  failed: boolean;
};

export async function searchCards(
  filters: FilterOptions,
  page: number = 1,
  sort: SortKey = DEFAULT_SORT
): Promise<SearchResult> {
  try {
    let query = 'game:paper ';

    // Build search query
    const queryParts: string[] = [];

    if (filters.search) {
      const terms = nameTerms(filters.search);

      // Every card matches a name filter with no word in it, so a search of nothing but
      // quotes would answer with the whole game under a chip that says otherwise.
      if (terms.length === 0) {
        return { cards: [], total: 0, hasMore: false, failed: false };
      }

      queryParts.push(...terms);
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
      // Scryfall answers 404 when a query matches nothing, which is a real result.
      if (response.status === 404) {
        return { cards: [], total: 0, hasMore: false, failed: false };
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
      failed: false,
    };
  } catch (error) {
    console.error('Error searching cards:', error);
    return { cards: [], total: 0, hasMore: false, failed: true };
  }
}

// How long a card answer is held on the server. Without it, every view of a card page
// reads that card from Scryfall again, however many people ask for the same card. The
// rules text of a printed card never changes, and Scryfall moves its prices about once
// a day, so an hour keeps the page close to the price it shows. Scryfall asks callers
// to cache what they can.
const CARD_TTL_SECONDS = 60 * 60;

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

// A card always matches its own printings query, so an empty answer here nearly always
// means the request never got through. The gallery used to read that as a fact about the
// card and say "only one printing", which is the same mistake the search flag prevents.
export type PrintsResult = {
  cards: Card[];
  total: number;
  hasMore: boolean;
  failed: boolean;
};

export async function fetchCardPrints(
  card: Card,
  page: number = 1,
  unique: PrintsUnique = DEFAULT_PRINTS_UNIQUE
): Promise<PrintsResult> {
  try {
    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(printsQuery(card))}` +
        `&unique=${unique}&order=released&dir=desc&page=${page}`,
      { headers: SCRYFALL_HEADERS, next: { revalidate: CARD_TTL_SECONDS } }
    );

    if (!response.ok) {
      // A card with no paper printing at all answers 404, which is a real result.
      if (response.status === 404) {
        return { cards: [], total: 0, hasMore: false, failed: false };
      }
      throw new Error(`Scryfall prints search failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      cards: data.data || [],
      total: data.total_cards || 0,
      hasMore: Boolean(data.has_more),
      failed: false,
    };
  } catch (error) {
    console.error('Error fetching card prints:', error);
    return { cards: [], total: 0, hasMore: false, failed: true };
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
    const response = await fetch(`${SCRYFALL_API_BASE}/cards/${id}`, {
      headers: SCRYFALL_HEADERS,
      next: { revalidate: CARD_TTL_SECONDS },
    });

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
      // The one request here that must never be answered twice with the same card.
      cache: 'no-store',
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

// Each link says what the site answers, because a row of brand names alone makes the
// visitor open every one to find out which holds the rulings.
export type ExternalLink = { name: string; url: string; hint: string };

// Gatherer addresses a card by the multiverse id of the printing, not by its name.
function buildGathererUrl(card: Card): string {
  if (card.related_uris?.gatherer) {
    return card.related_uris.gatherer;
  }
  // Some paper printings carry no multiverse id. The name search still finds them, where
  // the card page answers a name with the Gatherer home page.
  return `https://gatherer.wizards.com/search?searchTerm=${encodeURIComponent(card.name)}`;
}

// The product page shows the exact printing and its sellers. TCGplayer numbers only the
// cards it sells, so the rest fall back to a search.
function buildTcgplayerUrl(card: Card): string {
  if (card.tcgplayer_id) {
    return `https://www.tcgplayer.com/product/${card.tcgplayer_id}`;
  }
  return `https://www.tcgplayer.com/search/all/product?productLineName=magic&q=${encodeURIComponent(card.name)}`;
}

// EDHREC removes the punctuation that a card name carries, so "Ajani's Pridemate" becomes
// "ajanis-pridemate" and "Fire // Ice" becomes "fire-ice". The redirect route applies
// those rules for us, which keeps this app from copying them and getting them wrong.
function buildEdhrecUrl(card: Card): string {
  return (
    card.related_uris?.edhrec ?? `https://edhrec.com/route/?cc=${encodeURIComponent(card.name)}`
  );
}

// Archidekt keys its card pages on the Scryfall id, so the link opens the printing on
// screen rather than a search, and shows the art of that printing.
function buildArchidektUrl(card: Card): string {
  return `https://archidekt.com/card?name=${encodeURIComponent(card.name)}&uid=${card.id}`;
}

export function getExternalLinks(card: Card): ExternalLink[] {
  const links: ExternalLink[] = [
    { name: 'Scryfall', url: card.scryfall_uri, hint: 'Rulings and printings' },
  ];

  // These three sites cover paper cards only. A card that exists on Arena or Magic Online
  // alone gets no link to them, because Gatherer answers with its home page, TCGplayer
  // sells nothing to find, and EDHREC answers with a 404.
  if (card.games.includes('paper')) {
    links.push(
      { name: 'Gatherer', url: buildGathererUrl(card), hint: 'The official card page' },
      { name: 'TCGplayer', url: buildTcgplayerUrl(card), hint: 'Buy a copy' },
      { name: 'EDHREC', url: buildEdhrecUrl(card), hint: 'Commander decks and pairings' }
    );
  }

  // Archidekt indexes the digital cards too, so it is the one link every card keeps.
  links.push({ name: 'Archidekt', url: buildArchidektUrl(card), hint: 'Add it to a deck' });

  return links;
}
