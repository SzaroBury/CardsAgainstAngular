import { Deck } from "./Deck";
import { RoomState } from "./Room";
import { Card, Game, Sentence } from "./Game";
import { User } from "./User";

export interface RoomDto {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  maxPlayers: number;
  users: User[];
  bannedUsers: string[];
  decks: Deck[];
  sentences: Sentence[];
  cards: Card[];
  state: RoomState;
  game?: Game | null;
}