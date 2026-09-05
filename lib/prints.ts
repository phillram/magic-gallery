import { Card } from './types';

// Scryfall spreads a printing's treatment across several fields, and most of their
// values are internal tokens rather than anything a player would recognize. Each map
// below is an allowlist: an unmapped value is dropped instead of shown raw, which is
// also what keeps "legendary" off every legendary creature.
const BORDER_LABELS: Record<string, string> = {
  borderless: 'Borderless',
  white: 'White border',
  silver: 'Silver border',
  gold: 'Gold border',
};

const FRAME_EFFECT_LABELS: Record<string, string> = {
  showcase: 'Showcase',
  extendedart: 'Extended art',
  etched: 'Etched',
  inverted: 'Inverted',
  fullart: 'Full art',
  shatteredglass: 'Shattered glass',
  colorshifted: 'Colorshifted',
};

const PROMO_TYPE_LABELS: Record<string, string> = {
  serialized: 'Serialized',
  halofoil: 'Halo foil',
  surgefoil: 'Surge foil',
  galaxyfoil: 'Galaxy foil',
  textured: 'Textured foil',
  rainbowfoil: 'Rainbow foil',
  doublerainbow: 'Double rainbow',
  confettifoil: 'Confetti foil',
  ripplefoil: 'Ripple foil',
  fracturefoil: 'Fracture foil',
  raisedfoil: 'Raised foil',
  oilslick: 'Oil slick',
  gilded: 'Gilded',
  neonink: 'Neon ink',
  stepandcompleat: 'Step-and-compleat',
  prerelease: 'Prerelease',
  promopack: 'Promo pack',
  buyabox: 'Buy-a-box',
  bundle: 'Bundle',
  judgegift: 'Judge gift',
};

// What makes one printing worth picking over another from the same set.
export function printVariantLabels(card: Card): string[] {
  const labels: string[] = [];

  const borderLabel = BORDER_LABELS[card.border_color ?? ''];
  if (borderLabel) {
    labels.push(borderLabel);
  }

  for (const effect of card.frame_effects ?? []) {
    const label = FRAME_EFFECT_LABELS[effect];
    if (label) {
      labels.push(label);
    }
  }

  if (card.full_art) {
    labels.push('Full art');
  }

  if (card.textless) {
    labels.push('Textless');
  }

  const promoLabels = (card.promo_types ?? [])
    .map((type) => PROMO_TYPE_LABELS[type])
    .filter((label): label is string => Boolean(label));

  labels.push(...promoLabels);

  // A bare "Promo" is only worth saying when nothing more specific already said it.
  if (card.promo && promoLabels.length === 0) {
    labels.push('Promo');
  }

  return Array.from(new Set(labels));
}

// Which printings show the same art. Scryfall keeps the oldest printing of an art, so
// the printing a visitor arrives from is often not the one on the page, and this is
// what still points them at their own art.
export function printArtKey(card: Card): string {
  if (card.illustration_id) {
    return card.illustration_id;
  }

  // A double-faced card is new art only when a face changed, so both faces make the key.
  const faceIds = (card.card_faces ?? [])
    .map((face) => face.illustration_id)
    .filter((id): id is string => Boolean(id));

  if (faceIds.length > 0) {
    return faceIds.join('|');
  }

  // With no illustration id there is nothing to compare, so the printing stands alone
  // rather than being matched with an unrelated one.
  return card.id;
}

export type PrintGroup = {
  code: string;
  name: string;
  releasedAt: string;
  cards: Card[];
};

// Sets keep the order Scryfall returned them in, which is newest release first.
// Printings are merged by set code rather than gathered from a run, because loading
// another page can hand back more cards from a set that is already on screen.
export function groupPrintsBySet(cards: Card[]): PrintGroup[] {
  const groups = new Map<string, PrintGroup>();

  for (const card of cards) {
    const group = groups.get(card.set);

    if (group) {
      group.cards.push(card);
      continue;
    }

    groups.set(card.set, {
      code: card.set,
      name: card.set_name,
      releasedAt: card.released_at,
      cards: [card],
    });
  }

  return Array.from(groups.values());
}
