export type CardFace = {
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
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
  mana_cost?: string;
  power?: string;
  toughness?: string;
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
