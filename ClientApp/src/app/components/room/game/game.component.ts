import { Component } from '@angular/core';
import { ChosenCards, Player } from 'src/app/model/Game';
import { GameService } from 'src/app/services/current-room/game/game.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    standalone: false
})
export class GameComponent {
  game = this.gameService.game;
  user = this.userService.getCurrentUser('GameComponent');

  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService
  ) {}

  winnerPlayerName(): string {
    if(this.game()) {
      const winnerId = this.game()?.chosenCards.find((cc: ChosenCards) => cc.winner == true)?.playerId;
      const winner = this.game()?.players.find((pl: Player) => pl.id === winnerId);
      return winner?.name ?? '';
    } else return '';
  }
}