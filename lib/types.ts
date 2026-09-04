export type CardFace = {
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
};

export type Card = {
  id: string;
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
};

export type Set = {
  id: string;
  code: string;
  name: string;
  released_at: string;
  card_count: number;
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
