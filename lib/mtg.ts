// Colorless is a color to filter by, even though it is the absence of the other five.
export const COLOR_NAMES: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
  C: 'Colorless',
};

export const COLORS = Object.keys(COLOR_NAMES);

// The formats a player asks about first. Scryfall sends about twenty, and the rest
// answer questions almost nobody has on a card page.
export const SHOWN_FORMATS = [
  { key: 'standard', label: 'Standard' },
  { key: 'pioneer', label: 'Pioneer' },
  { key: 'modern', label: 'Modern' },
  { key: 'legacy', label: 'Legacy' },
  { key: 'vintage', label: 'Vintage' },
  { key: 'commander', label: 'Commander' },
  { key: 'pauper', label: 'Pauper' },
] as const;

export const LEGALITY_LABELS: Record<string, string> = {
  legal: 'Legal',
  not_legal: 'Not legal',
  restricted: 'Restricted',
  banned: 'Banned',
};
