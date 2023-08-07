import { Component, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Card, ChosenCards, Game, Player } from 'src/app/model/Game';

@Component({
  selector: 'app-game-hand',
  templateUrl: './game-hand.component.html',
  styleUrls: ['./game-hand.component.css']
})
export class GameHandComponent implements OnInit {
  
  @Input() game?: Game;
  @Input() userId?: string;
  playerIndex: number = -1;
  hand?: Card[] = [];

  ngOnInit(): void {
    if(this.game)
    {
      this.playerIndex = this.game.players.findIndex((player: Player) => player.id === this.userId);
    }
  }

  isCardChar(): boolean
  {
    if(this.game)
    {
      return this.game.chooserId === this.userId;
    }

    return false;
  }

  isSelected(card: Card): boolean
  {
    const result = this.game?.selectedCards.some((c: Card) => c.id === card.id);
    if(result) return result;
    else return false;
  }

  isPickable(card: Card): boolean
  {
    if(this.game && !this.isCardChar() && this.game.state == 0)
    {
      if(!this.game.cardsConfirmed)
      {
        if(this.game?.selectedCards.length < this.game.currentSentence.blankFields || this.isSelected(card))
        {
          return true;
        }
      }
      
    }
    return false;
  }

  selectUnselectCard(card: Card)
  {
    if(!this.isCardChar() && this.game)
    {
      if(this.isSelected(card))
      {
        //unselect card
        const index = this.game.selectedCards.findIndex((c: Card) => c.id === card.id);
        this.game.selectedCards.splice(index, 1);
      }
      else
      {
        //select card
        if(this.game.selectedCards.length < this.game.currentSentence.blankFields
          && this.game.players[this.playerIndex].hand.length == this.game.cardsInHand)
        {
          this.game.selectedCards.push(card);
        }
      }
    }
  }
}
