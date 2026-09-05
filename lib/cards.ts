import { Card } from './types';

// Scryfall pages a query it re-runs each time, so a card can arrive twice: a price
// changes under a price sort, or a new printing lands under a release sort, and the
// row that was last on page one is first on page two. Two tiles with one id is a
// React key collision, so the later copy is dropped.
export function appendNewCards(current: Card[], incoming: Card[]): Card[] {
  const seen = new Set(current.map((card) => card.id));
  return [...current, ...incoming.filter((card) => !seen.has(card.id))];
}
