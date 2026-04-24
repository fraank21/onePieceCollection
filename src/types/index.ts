export type Condition = "M" | "NM" | "EX" | "GD" | "LP" | "PL" | "PO";
export type Language = "EN" | "ES" | "FR" | "DE" | "IT" | "PT" | "JP" | "KO" | "ZHS" | "ZHT";

export interface Card {
  id: string;
  name: string;
  cardNumber: string;
  expansion: string;
  game: string;
  condition: Condition;
  language: Language;
  quantity: number;
  foil: boolean;
  imageUrl: string | null;
  cardmarketId: string | null;
  lastPrice: number | null;
  lastPriceUpdate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeckCard {
  id: string;
  quantity: number;
  cardId: string;
  deckId: string;
  card: Card;
}

export interface Deck {
  id: string;
  name: string;
  game: string;
  description: string | null;
  format: string | null;
  createdAt: string;
  updatedAt: string;
  deckCards: DeckCard[];
}

export const CONDITIONS: Condition[] = ["M", "NM", "EX", "GD", "LP", "PL", "PO"];
export const CONDITION_LABELS: Record<Condition, string> = {
  M: "Mint",
  NM: "Near Mint",
  EX: "Excellent",
  GD: "Good",
  LP: "Light Played",
  PL: "Played",
  PO: "Poor",
};

export const LANGUAGES: Language[] = ["EN", "ES", "FR", "DE", "IT", "PT", "JP", "KO", "ZHS", "ZHT"];
export const LANGUAGE_LABELS: Record<Language, string> = {
  EN: "English",
  ES: "Spanish",
  FR: "French",
  DE: "German",
  IT: "Italian",
  PT: "Portuguese",
  JP: "Japanese",
  KO: "Korean",
  ZHS: "Chinese Simplified",
  ZHT: "Chinese Traditional",
};

export const GAMES = [
  "One Piece",
  "Magic: The Gathering",
  "Yu-Gi-Oh!",
  "Pokemon",
  "Digimon",
  "Lorcana",
];
