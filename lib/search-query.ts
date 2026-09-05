// Scryfall reads a quoted term as one phrase, so the word order has to match the printed
// name. `name:"lightning bolt"` found the card and `name:"bolt lightning"` found nothing.
// Each word goes out as its own name term instead, and a name that holds every word
// matches however the words were typed.
//
// A quote inside the term used to end the term early, and the rest of what was typed
// became separate search syntax: `sol"ring` searched for `sol` and returned Solemn
// Offering. Scryfall has no escape for this, because `name:"sol\"ring"` is a syntax
// error. So a quote and a backslash both become a space, which splits the term rather
// than joining two words into one. Scryfall already ignores the rest of the punctuation
// in a name, so `Ajanis Pridemate` still finds Ajani's Pridemate.
export function nameTerms(search: string): string[] {
  return search
    .replace(/["\\]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `name:"${word}"`);
}
