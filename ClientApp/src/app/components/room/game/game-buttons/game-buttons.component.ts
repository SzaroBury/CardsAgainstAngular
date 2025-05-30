import { Component } from '@angular/core';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';
import { GameService } from 'src/app/services/current-room/game/game.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-game-buttons',
    templateUrl: './game-buttons.component.html',
    styleUrls: ['./game-buttons.component.css'],
    standalone: false
})
export class GameButtonsComponent {
  // room = this.currentRoomService.getCurrentRoom();
  game = this.gameService.game;
  user = this.userService.getCurrentUser("GameButtonsComponent");
  tip = "";

  constructor(
    private readonly currentRoomService: CurrentRoomService,
    private readonly gameService: GameService,
    private readonly userService: UserService
  ) {}

  calculateTip(): string {
    const game = this.game();
    if(game) {
      if(game.state === 1) { // PickCards
        if(this.gameService.isCardChar()) {
          return "You are the Card Char!\nWait for others to pick their answers.";
        } else if(!this.gameService.hasPlayerAlreadySentCards()) {
          const blankFields = game.currentSentence?.blankFields;
          if(blankFields > 1) {
            return `Pick ${blankFields} cards in correct order.`;
          } else return "Pick the best matching card.";
        } else return "Wait for others to pick their answers.";
      } else if(game.state === 2) { //Show cards
        if(this.gameService.isCardChar()) {
          return "Pick the best matching answer.";
        } else return "Wait for the decision... 🥁";
      } else if (game.state === 3) { //Show winner
        if(this.gameService.isCardChar()) {
          return "Click the button to continue.";
        } else return "Wait for next the round.";
      } else if (game.state === 4) { // Finished
        const roomOwnerId = this.currentRoomService.room()?.ownerId;
        if( roomOwnerId === this.user?.id ) {
          return "Click the button to start a new game.";
        } else return "The game is finished. Wait for the owner to start a new one."
      }
    }
    return "Error. No game object found."
  }

  isConfirmDisabled() {
    const game = this.gameService.game();
    if(game) {
      if(game.state === 1) { // Picking cards
        const selectedCardsLength = this.gameService.selectedCards().length;
        const blankFields = game.currentSentence.blankFields;
        const hasPlayerChosenCards = this.gameService.hasPlayerAlreadySentCards();
        return selectedCardsLength !== blankFields && !hasPlayerChosenCards;
      }
      else if(game.state === 2) { // Showing cards
        const selectedCardsSet = this.gameService.selectedCardsSet();
        return !selectedCardsSet;
      }
    }

    return false;
  }

  showConfirmButton() {
    const gameState = this.gameService.game()?.state;
    if(gameState === 1) {
      return !this.gameService.isCardChar() && !this.gameService.hasPlayerAlreadySentCards();
    } else if(gameState === 2) {
      return this.gameService.isCardChar();
    }
    return false;
  }

  showNextRoundButton(): boolean {
    const gameState = this.gameService.game()?.state;
    return (gameState === 3 && this.gameService.isCardChar()) ?? false;
  }

  confirm(): void {
    const gameState = this.gameService.game()?.state;
    if(gameState) {
      if(gameState === 1) {
        this.gameService.confirmSelectedCards();
        this.tip = "Wait for others to pick their answers.";
      } else if(gameState === 2) {
        this.gameService.confirmWinner();
      }
    }
  }

  nextRound(): void {
    this.gameService.nextRound();
  }

}
