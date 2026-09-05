export type CardFace = {
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  // The italic line under the rules text. It is not rules, so it is set apart.
  flavor_text?: string;
  power?: string;
  toughness?: string;
  // Planeswalkers carry loyalty and battles carry defense, where a creature carries
  // power and toughness.
  loyalty?: string;
  defense?: string;
  artist?: string;
  // Double-faced cards carry an illustration id per face rather than one for the card.
  illustration_id?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
};

export type Card = {
  id: string;
  // Absent on reversible cards, which carry it per face instead.
  oracle_id?: string;
  name: string;
  uri: string;
  scryfall_uri: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  flavor_text?: string;
  mana_cost?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  defense?: string;
  rarity?: string;
  set: string;
  set_name: string;
  released_at: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
  card_faces?: CardFace[];
  layout: string;
  keywords?: string[];
  color_identity?: string[];
  // Format name to one of legal, not_legal, restricted, or banned.
  legalities?: Record<string, string>;
  // How often the card is played in Commander decks. 1 is the most played card.
  edhrec_rank?: number;
  games: string[];
  artist?: string;
  // Printings that share this share one piece of art. Absent on double-faced cards.
  illustration_id?: string;
  collector_number?: string;
  prices?: {
    usd: string | null;
    usd_foil: string | null;
    eur: string | null;
  };
  // TCGplayer numbers its own products. Cards it does not sell carry no number.
  tcgplayer_id?: number;
  // Scryfall builds these links itself, which keeps each site's own URL rules out of this
  // app. The gatherer link is absent for a printing that has no multiverse id.
  related_uris?: {
    gatherer?: string;
    edhrec?: string;
  };
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  oversized: boolean;
  finishes: string[];
  frame_effects?: string[];
  promo_types?: string[];
  promo?: boolean;
  border_color?: string;
  full_art?: boolean;
  textless?: boolean;
};

export type Set = {
  id: string;
  code: string;
  name: string;
  released_at: string;
  card_count: number;
  // Digital-only sets have no paper printings, so the set picker leaves them out.
  digital?: boolean;
};

export type FilterOptions = {
  search: string;
  sets: string[];
  colors: string[];
  types: string[];
  rarities: string[];
  minMana: number | null;
  maxMana: number | null;
  exactMana: number | null;
};
