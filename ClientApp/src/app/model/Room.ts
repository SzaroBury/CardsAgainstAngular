import { Game, Card, Sentence } from "./Game";
import { User } from "./User";

export class Room 
{
  guid : string = "";
  name : string = "";
  maxPlayers : number = 5;
  state: RoomState = RoomState.New;
  
  ownerGuid : string = ""; //uuid
  ownerName : string = "";
  
  game : Game = new Game();
  sentences : Sentence[] = [];
  cards : Card[] = [];
  users : User[] = [];
  messages: Message[] = [];
}

export class Message
{
  userId: string = "";
  content: string = "";
  created: string = new Date().toLocaleTimeString();
  systemLog: boolean = false;
}

export enum RoomState
{
  New,
  Ingame,
  Finished
}