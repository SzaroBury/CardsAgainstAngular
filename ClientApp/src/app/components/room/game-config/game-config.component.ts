import { Component, signal} from '@angular/core';
import { HttpErrorResponse } from 'src/app/model/HttpResponseError';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';
import { UserService } from 'src/app/services/user/user.service';

//todo: move cards and sentecnces to new components; send each card and sentence to the server on edit; new game; save sentences/cards to file; edit cards and sentences;
@Component({
    selector: 'app-game-config',
    templateUrl: './game-config.component.html',
    styleUrls: ['./game-config.component.css'],
    standalone: false
})
export class GameConfigComponent {
  room             = this.currentRoomService.getCurrentRoom();
  user             = this.userService.getCurrentUser("GameConfigComponent");
  cardsPerHand      = this.currentRoomService.cardsPerHand;
  scoreToWin       = this.currentRoomService.scoreToWin;
  showDecks        = signal(false);
  showNewDeckInput = signal(false);
  error: HttpErrorResponse | null = null;

  constructor(
    private readonly currentRoomService: CurrentRoomService,
    private readonly userService: UserService
  ) {}

  newGame(): void {
    const cardsPerHand = this.currentRoomService.cardsPerHand();
    const scoreToWin = this.currentRoomService.scoreToWin();
    if(this.startGameConditions()) {   
      this.currentRoomService.newGame(cardsPerHand, scoreToWin);
    } else {
      alert("Incorrect configuration. The game cannot be started.")
    }
  }

  isEnoughPlayers(): boolean {
    const usersLength = this.room()?.users?.length ?? 0;
    return usersLength > 2;
  }

  isEnoughCardsForPlayers(): boolean {
    const cardsCount = this.room()?.cards.length ?? 0;
    const usersCount = this.room()?.users?.length ?? 0;
    const minPlayers = 3;
    const playersCount = Math.max(usersCount, minPlayers);
    const cardsPerHand = this.currentRoomService.cardsPerHand();

    return playersCount * cardsPerHand <= cardsCount;
  }

  isEnoughSentencesForTargetScore(): boolean { 
    const sentencesCount = this.room()?.sentences?.length ?? 0;
    const scoreToWin = this.currentRoomService.scoreToWin();

    const result = sentencesCount >= scoreToWin;
    return result;
  }

  startGameConditions(): boolean {
    const result = (
      this.isEnoughPlayers()                      //You need at least 3 players to start a new game.
      && this.isEnoughCardsForPlayers()           //Too few cards to be dealt to all players
      && this.isEnoughSentencesForTargetScore()); //Too few sentences to reach the score target
    return result;
  }

  loadDecks() {
    this.showDecks.set(true);
  }
  
  handleCloseDecks() {
    this.showDecks.set(false);
  }

  isError = (): boolean => { 
    return this.error !== null; 
  }

  increaseCardsPerHand() { 
    this.currentRoomService.cardsPerHand.update(cardsPerHand => cardsPerHand + 1);
  }

  decreaseCardsPerHand() {
    const cardsPerHand = this.currentRoomService.cardsPerHand();
    if(cardsPerHand > 1) { 
      this.currentRoomService.cardsPerHand.set(cardsPerHand - 1);
    }
  } 

  increaseScoreToWin() { 
    this.currentRoomService.scoreToWin.update(scoreToWin => scoreToWin + 1);
  }

  decreaseScoreToWin() {
    const scoreToWin = this.currentRoomService.scoreToWin();
    if(scoreToWin > 1) { 
      this.currentRoomService.scoreToWin.set(scoreToWin - 1);
    }
  } 

  removeDeck(id: string): void {
    this.currentRoomService.removeDeck(id);
  }
}
