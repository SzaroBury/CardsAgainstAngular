import { Component, Input  } from '@angular/core';
import { Game, ChosenCards } from 'src/app/model/Game';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent {
  
  @Input() userId?: string;
  @Input() game?: Game;
  // @Input() chosenCards?: ChosenCards;
  // @Input() winnerCards?: ChosenCards;
  chooserId?: string;
  selectedCardSet?: ChosenCards;

  public isSelected(cardSet: ChosenCards) : boolean
  {
    if(this.game)
    {
      return this.game.selectedCardsSet === cardSet;
    } 
    return false;
  }

  public isPickable(cardSet: ChosenCards): boolean
  {
    if(this.game)
    {
      return this.game.chooserId === this.userId && this.game.state == 1;
    }
    return false;
  }

  public isWinner(cardSet: ChosenCards): boolean
  {
    return cardSet.winner;
  }

  public ifShowValues(): boolean
  {
    if(this.game)
    {
      return this.game.state !== 0;
    }
    return false;
  }

  public selectCard(cardSet: ChosenCards)
  {
    if(this.game && this.userId === this.game.chooserId)
    {
      if(this.game.selectedCardsSet === cardSet)
      {
        this.game.selectedCardsSet = undefined;
      }
      else
      {
        this.game.selectedCardsSet = cardSet;
      }
    }
  }
}
