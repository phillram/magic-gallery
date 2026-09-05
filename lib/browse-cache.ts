import { Card } from './types';

// Opening a card and coming back rebuilt the browse page from nothing. A visitor who had
// pressed "Show more cards" four times lost every page but the first, and the grid then
// stood too short for the browser to put the scroll back.
//
// The results of each query are held here instead. The cache lives as long as the tab
// does, it never reaches the server, and it holds only what this visitor already asked
// for, so a step back costs Scryfall nothing.
export type BrowseResults = {
  cards: Card[];
  // The last page read from Scryfall, which is what "Show more cards" counts on from.
  page: number;
  total: number;
  hasMore: boolean;
};

// A card carries its whole Scryfall record, and a page holds 175 of them, so this list
// is worth a cap. Three queries cover stepping back through the cards of one search and
// through the filter before it.
const MAX_QUERIES = 3;

const byQuery = new Map<string, BrowseResults>();

export function readBrowseResults(query: string): BrowseResults | undefined {
  return byQuery.get(query);
}

export function writeBrowseResults(query: string, results: BrowseResults): void {
  // A Map keeps its insertion order, so writing a query again moves it to the end and
  // the query nobody has come back to is the first one out.
  byQuery.delete(query);
  byQuery.set(query, results);

  for (const oldest of byQuery.keys()) {
    if (byQuery.size <= MAX_QUERIES) {
      break;
    }
    byQuery.delete(oldest);
  }
}
