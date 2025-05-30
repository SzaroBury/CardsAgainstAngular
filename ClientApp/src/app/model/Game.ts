import { Card } from "./Card";
import { ChosenCards } from "./ChosenCards";
import { Player } from "./Player";
import { Sentence } from "./Sentence";

export class Game {
  round : number = -1;
  cardsPerHand? : number;
  scoreToWin?: number;
  
  roomId: string = "";
  chooserId : string = "";
  
  state : GameState = 0;
  currentSentence = new Sentence();
  
  players : Player[] = [];
  chosenCards : ChosenCards[] = []; 
  selectedCards : Card[] = []; //to remove, store in a component
  selectedCardsSet?: ChosenCards; //to remove, store in a component
}

export enum GameState {
  "Not started",
  "Picking cards",
  "Showing cards",
  "Showing winner",
  "Finished"
}

export { Card, Sentence, ChosenCards, Player };