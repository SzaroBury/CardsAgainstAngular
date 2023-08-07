import { User } from "./User";

export class Game
{
  round : number = -1;
  cardsInHand : number = 3;
  scoreToWin: number = 3;
  cardsConfirmed: boolean = false;
  
  roomId: string = "";
  chooserId : string = "";
  
  state : GameState = 0;
  currentSentence : Sentence = new Sentence();
  
  players : Player[] = [];
  gameSentences : Sentence[] = [];
  gameCards : Card[] = [] 
  selectedCards : Card[] = [];
  chosenCards : ChosenCards[] = [];
  selectedCardsSet?: ChosenCards;
}

export class Sentence
{
  id : number = -1;
  value : string = "";
  blankFields : number = -1;
}

export class ChosenCards
{
  id: number = -1;
  playerId : string = "";
  cards : Card[] = [];
  winner: boolean = false;
}

export interface Card
{
  id : number;
  value : string
}


export interface Player extends User
{
  id: string;
  hand : Card[];
  score : number;
}

export enum GameState
{
  "Pick cards",
  "Show cards",
  "Show winner",
  Finished
}
