import { Component } from '@angular/core';
import { ChosenCards } from 'src/app/model/Game';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';
import { GameService } from 'src/app/services/current-room/game/game.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-game-board',
    templateUrl: './game-board.component.html',
    styleUrls: ['./game-board.component.css'],
    standalone: false
})
export class GameBoardComponent {
  // room = this.currentRoomService.getCurrentRoom();
  game = this.gameService.game;
  user = this.userService.getCurrentUser('GameBoardComponent');
  selectedCardSet?: ChosenCards;

  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService
  ) {}

  public isSelected(cardSet: ChosenCards) : boolean {
    return this.gameService.selectedCardsSet() === cardSet;
  }

  public isPickable(cardSet: ChosenCards): boolean {
    const gameState = this.game()?.state;
    return (gameState === 2
      && this.gameService.isCardChar()
    ) ?? false;
  }

  public ifShowValues(): boolean {
    const gameState = this.game()?.state ?? -1;
    return gameState > 1; 
  }

  public selectCard(cardSet: ChosenCards) {
    if(this.game()?.state == 2 && this.user?.id === this.game()?.chooserId) {
      this.gameService.selectCardsSet(cardSet);
    }
  }
}
