import { Component } from '@angular/core';
import { GameState } from 'src/app/model/Game';
import { RoomState } from 'src/app/model/Room';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';
import { GameService } from 'src/app/services/current-room/game/game.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-room-info',
    templateUrl: './room-info.component.html',
    styleUrls: ['./room-info.component.css'],
    standalone: false
})
export class RoomInfoComponent {
  room = this.currentRoomService.getCurrentRoom();
  game = this.gameService.game;
  user = this.userService.getCurrentUser('RoomInfoComponent');

  constructor(
    private readonly currentRoomService: CurrentRoomService,
    private readonly gameService: GameService,
    private readonly userService: UserService
  ) {}

  calculateRound(): string {
    const round = this.game()?.round;
    return round?.toString() ?? '-';
  }

  roomStateToString(): string {
    const roomState = this.room()?.state ?? -1;
    return RoomState[roomState] ?? '-';
  }

  gameStateToString(): string {
    const gameState = this.game()?.state ?? -1;
    return GameState[gameState] ?? '-';
  }

  players(): string {
    const players = this.game()?.players;
    const maxRoomPlayers = this.room()?.maxPlayers;
    if(players) {
      return `${players.length} / ${maxRoomPlayers}`;
    } else {
      return '- / -';
    }
  }

  calculateScoreToWin(): string {
    return this.currentRoomService?.scoreToWin()?.toString() ?? '-';
  }

  showFinishedButtons(): boolean {
    const roomOwnerId = this.room()?.ownerId;
    const gameState = this.game()?.state;
    const userId = this.user?.id;

    const result = gameState === 4 && roomOwnerId === userId;
    return result ?? false;
  }

  newGame(): void {
    const cardsInHand = this.currentRoomService.cardsPerHand();
    const scoreToWin = this.currentRoomService.scoreToWin();
    
    if(cardsInHand && scoreToWin) {
      this.currentRoomService.newGame(cardsInHand, scoreToWin);
    }
  }

  editNewGame(): void {
    this.currentRoomService.editNewGame();
  }
}