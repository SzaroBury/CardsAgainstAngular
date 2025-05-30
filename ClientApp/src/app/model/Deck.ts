import { Card } from "./Card";
import { Sentence } from "./Sentence";

export interface Deck {
  id: string;
  name: string;
  authorUsername: string;
  language: Language;
  sentences : Sentence[];
  cards : Card[];
}

export enum Language {
  "English",
  "Polish"
}