import { Deck } from "./Deck";
import { Game, Card, Sentence } from "./Game";
import { Message } from "./Message";
import { User } from "./User";

export class Room {
  id : string = "";
  name : string = "";
  maxPlayers : number = 5;
  state: RoomState = RoomState.Configuration;
  
  ownerId : string = "";
  ownerName : string = "";
  
  sentences : Sentence[] = [];
  cards : Card[] = [];
  users : User[] = [];
  bannedUsers : string[] = [];  
  messages : Message[] = [];
  decks : Deck[] = [];
}

export enum RoomState {
  Configuration,
  Ingame,
  Finished
}

export { Message }