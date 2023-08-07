import { Component, Input, OnInit } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { Card, ChosenCards, Game, Player } from 'src/app/model/Game';
import { RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-game-buttons',
  templateUrl: './game-buttons.component.html',
  styleUrls: ['./game-buttons.component.css']
})
export class GameButtonsComponent implements OnInit {
  
  @Input() game?: Game;
  @Input() userId = "";
  @Input() ownerId = "";
  @Input() connection?: HubConnection;
  @Input() selectedCards: Card[] = [];
  tip = "";

  constructor(private roomService: RoomService)
  {

  }

  ngOnInit(): void 
  {
  }

  calculateTip(): string
  {
    if(this.game)
    {
      if(this.game.state === 0) // PickCards
      {
        if( this.game.chooserId === this.userId ) return "You are the Card Char!\nWait for others to pick their answers.";
        else if( !this.game.chosenCards.some((cc: ChosenCards) => cc.playerId === this.userId) )
        {
          if( this.game.currentSentence.blankFields > 1 ) return "Pick " + this.game.currentSentence.blankFields + " cards in correct order.";
          else return"Pick the best matching card."
        }
        else return "Wait for others to pick their answers.";
      }
      else if(this.game.state === 1) // ShowCards
      {
        if( this.game.chooserId === this.userId ) return "Pick the best matching answer.";
        else return "Wait for the decision... 🥁";
      }
      else if (this.game.state === 2) // ShowWinner
      {
        if( this.game.chooserId === this.userId ) return "Click the button to continue.";
        else return "Wait for next the round.";
      }
      else if (this.game.state === 3) // Finished
      {
        if( this.ownerId === this.userId ) return "Click the button to start a new game.";
        else return "The game is finished. Wait for the owner to start a new one."
      }
    }
    return "Error. No game object found."
  }

  isConfirmDisabled()
  {
    if(this.game)
    {
      if(this.game.state === 0) //PickCards
      {
        if( this.game.selectedCards.length === this.game.currentSentence.blankFields ) return false; //&& !this.game.chosenCards.some( (cc: ChosenCards) => cc.playerId === this.userId )
        else return true;
      }
      else if(this.game.state === 1) // ShowCards
      {
        if( this.game.chooserId === this.userId && this.game.selectedCardsSet) return false;
        else return true;
      }
      else return false;
    }
    else
    {
      this.tip = "Error. No game object found."
    }
    return false;
  }

  showConfirmButton()
  {
    if(this.game)
    {
      if(this.game.state === 0) //PickCards
      {
        if( this.game.chooserId !== this.userId) return true;
      }
      else if(this.game.state === 1) // ShowCards
      {
        if( this.game.chooserId === this.userId ) return true;
      }
      else return false;
    }
    else
    {
      this.tip = "Error. No game object found."
    }
    return false;
  }

  showNextRoundButton(): boolean
  {
    if(this.game?.state === 2 && this.game.chooserId === this.userId) return true;
    return false;
  }

  confirm()
  {
    if(this.game)
    {
      if(this.game.state === 0)
      {
        const chosenCards = new ChosenCards();
        chosenCards.playerId = this.userId; 
        chosenCards.cards = this.game.selectedCards;
  
        //sent cards to server
        this.connection?.invoke("CardsConfirmed", this.game.roomId, chosenCards);
        


        //remove selected cards from hand
        const playerIndex = this.game.players.findIndex(p => p.id === this.userId);
        const hand = this.game.players[playerIndex].hand;
        this.game.players[playerIndex].hand = hand.filter(cardInHand => !this.game?.selectedCards.some(selectedCard => selectedCard.id === cardInHand.id));

        // mark flag that current user already made his choice
        this.game.cardsConfirmed = true;

        //unselect all
        this.game.selectedCards = [];
  
        //set tip
        // this.tip = "Wait for others to pick their answers.";
      }
      else if(this.game.state === 1)
      {
        if(this.connection)
        {
          this.connection?.invoke("ChoosedAnswer", this.game.roomId, this.userId, this.game.selectedCardsSet?.id);
        }
      }
    }
  }

  nextRound()
  {
    if(this.game)
    {
      this.connection?.invoke("NextRound", this.game.roomId, this.userId);
    }
  }

}
