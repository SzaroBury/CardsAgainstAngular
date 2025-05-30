import { Component} from '@angular/core';
import { Card} from 'src/app/model/Game';
import { GameService } from 'src/app/services/current-room/game/game.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-game-hand',
    templateUrl: './game-hand.component.html',
    styleUrls: ['./game-hand.component.css'],
    standalone: false
})
export class GameHandComponent {
  // room = this.currentRoomService.getCurrentRoom();
  user = this.userService.getCurrentUser('GameHandComponent');
  hand = this.gameService.handCards;
  selectedCards: Card[] = [];

  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService
  ) {}

  isCardChar = () => this.gameService.isCardChar();

  isSelected(card: Card): boolean {
    return this.gameService.selectedCards().some((c: Card) => c.id === card.id);
  }

  isPickable(card: Card): boolean {
    return this.gameService.isCardPickable(card);
  }

  selectUnselectCard(card: Card) {
    this.gameService.changeSelectionOfTheCard(card);
  }
}
