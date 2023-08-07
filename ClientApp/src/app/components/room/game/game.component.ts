import { Component, Input, OnInit } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { Card, ChosenCards, Game, Player } from 'src/app/model/Game';

//todo: convert blazor to angular
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @Input() game?: Game;
  @Input() userId: string = "";
  @Input() ownerId: string = "";
  @Input() connection?: HubConnection;
  selectedCards: Card[] = [];
  player?: Player;

  ngOnInit(): void 
  {
  }

  winnerPlayerName(): string
  {
    if(this.game)
    {
      const winnerId = this.game.chosenCards.find((cc: ChosenCards) => cc.winner == true)?.playerId;
      const winner = this.game.players.find((pl: Player) => pl.id === winnerId);
      if(winner) return winner.name;
    }
    return "";
  }

}
