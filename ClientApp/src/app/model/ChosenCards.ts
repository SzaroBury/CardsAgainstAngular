import { Card } from "./Card";

export class ChosenCards
{
  id: string = '';
  playerId : string = '';
  cards : Card[] = [];
  winner: boolean = false;

  constructor(id: string, playerId: string, blankFields: number) {
    this.id = id;
    this.playerId = playerId;

    let newCardsSet: Card[] = [];
    for(let i = 0; i < blankFields; i++) {
      newCardsSet.push({ id: i.toString(), value: "" });
    }
            
    this.cards = newCardsSet;
  } 
}

export class ChosenCardsDTO
{
  playerId : string = '';
  cards : Card[] = [];

  constructor(playerId: string, cards: Card[]) {
    this.playerId = playerId;
    this.cards = cards;
  } 
}