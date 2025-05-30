import { Injectable, signal } from '@angular/core';
import { UserService } from '../../user/user.service';
import { ChosenCards, ChosenCardsDTO } from 'src/app/model/ChosenCards';
import { Card } from 'src/app/model/Card';
import { RoomService } from '../../room/room.service';
import { Game, Sentence } from 'src/app/model/Game';
import { HubConnection } from '@microsoft/signalr';
import { User } from 'src/app/model/User';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  game = signal<Game | null>(null);
  connection: HubConnection | undefined;
  handCards = signal<Card[]>([]);
  selectedCardsSet = signal<ChosenCards | null>(null);
  selectedCards = signal<Card[]>([]);
  // roomSentences: Sentence[] = [];
  
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService
  ) { }

  loadGame(game: Game) {
    console.log(`GameService.loadGame(game: `, game, ')');
    this.game.set(game);
    this.loadHand();
  }

  loadHand(): void {
    console.log(`GameService.loadHand()`); //to get roomId from user

    this.roomService.getPlayerHand().subscribe({
      next: hand => {
        this.handCards.set(hand);
      },
    })

  }

  selectCardsSet(cardSet: ChosenCards): void {
    console.log(`GameService.selectCardsSet(cardSet: <ChosenCards object>)`);
    const selectedCardsSet = this.selectedCardsSet();
    const gameState = this.game()?.state;

    if(this.isCardChar() && gameState === 2) {
      if(selectedCardsSet === cardSet) {   
        this.selectedCardsSet.set(null);
      } else {
        this.selectedCardsSet.set(cardSet)
      }
    }
  }

  changeSelectionOfTheCard(card: Card): void {
    console.log(`GameService.changeSelectionOfTheCard(card: <Card object>)`);

    if(this.isCardChar()) {
      console.warn("You are the CardChar. You can not selects cards.");
    }

    if(this.isSelected(card)) {
      //unselect card
      this.selectedCards.update(cards => cards.filter(c => c.id !== card.id)); 
    }
    else {
      //select card
      const currentSentenceBlankFields = this.game()?.currentSentence?.blankFields ?? -1;
      if(this.selectedCards().length < currentSentenceBlankFields) {
        this.selectedCards.update(cards => [...cards, card]);
      }
    }
  }

  confirmSelectedCards(): void {
    console.log('GameService.confirmSelectedCards()');

    const gameState = this.game()?.state;
    const roomId = this.game()?.roomId;
    const playerId = this.userService.currentUser()?.id;
    const selectedCards = this.selectedCards();
    
    if(gameState === 1) {
      if(this.connection && roomId && playerId && selectedCards) {
        //sent cards to server
        const chosenCards = new ChosenCardsDTO(playerId, selectedCards);
        this.connection?.invoke("ConfirmCards", roomId, chosenCards);
  
        //remove selected cards from hand
        const changedHand = this.handCards().filter(cardFromHand => !selectedCards.some(selectedCard => selectedCard.id === cardFromHand.id));
        if(changedHand) {
          this.handCards.set(changedHand);
        }
  
        //unselect all
        this.selectedCards.set([]);
      }
    }
  }

  confirmWinner(): void {
    console.log(`GameService.confirmWinner()`);

    const userId = this.userService.currentUser()?.id;
    const roomId = this.game()?.roomId;
    const selectedCardsSetId = this.selectedCardsSet()?.id;

    if(this.connection && roomId && userId && selectedCardsSetId) {
      this.connection?.invoke("ChooseAnswer", roomId, userId, selectedCardsSetId);
    }
  }
  
  initWebSocket(connection: HubConnection): void {
    this.connection = connection;

    // connection.on('userJoined', (user: User) => {
    //   console.log("GameService.userJoined(user: '" + user.id + "')");
    // });

    // connection.on('userLeft', (user: User) => {
    //   console.log(`GameService.userLeft(username: '${user.name}' userId: ${user.id})`);
    //   const currentUserId = this.userService.currentUser()?.id;

    //   if(currentUserId) {
    //     if(currentUserId === user.id) {
    //       //cleaning the game
    //       this.userService.leaveRoom();
    //       this.handCards.set([]);
    //       this.selectedCards.set([]);
    //       this.selectedCardsSet.set(null);
    //     } 
    //   } else {
    //     console.error('if currentUserId');
    //   }      
    // });

    // connection.on('newGameStarted', () => {

    // });

    // connection.on('cardsConfirmed', (chosenCards) => {
    //   console.log("RoomHub: cardsConfirmed()", chosenCards);
    //   let game = this.game();
    //   const blankFields = this.game()?.currentSentence.blankFields;
    //   if(game && blankFields) {
    //     const newCardSet = new ChosenCards(chosenCards.id, chosenCards.playerId, blankFields);
    //     game?.chosenCards.push(newCardSet);
    //     this.game.set({ ...game});
    //   } 
    // });
  }

  nextRound(): void {
    console.log(`gameService.nextRound()`);

    if(this.game()?.roomId) {
      this.connection?.invoke("NextRound", this.game()?.roomId);
    }
  }

  nextRoundStarted(hand: Card[], currentSentence: Sentence, chooserId: string): void {
    console.log("GameService.nextRoundStarted");
    this.handCards.set([]);
    this.selectedCards.set([]);
    this.selectedCardsSet.set(null);
    
    if(this.game() && currentSentence && hand && chooserId) {
      this.game.update((game) => {
        if(game) {
          game.round = game.round + 1;
          game.chooserId = chooserId;
          game.currentSentence = currentSentence;
          game.chosenCards = [];
          game.state = 1;
          this.handCards.set(hand);       
        }
        return game;
      });
    }
  }

  newGameStarted(game: Game, hand: Card[]): void {
    this.handCards.set([]);
    this.selectedCards.set([]);
    this.selectedCardsSet.set(null);

    if(game && hand) {
      this.game.set(game);
      this.handCards.set(hand);
    }
  }

  isCardChar(): boolean {
    const chooserId = this.game()?.chooserId;
    const userId = this.userService.currentUser()?.id;
    return chooserId === userId;
  }

  isCardPickable(card : Card) : boolean {
    const currentBlankFields = this.game()?.currentSentence?.blankFields ?? 0;
    const notEnoughSelectedCards = this.selectedCards().length < currentBlankFields

    return this.game()?.state === 1
      && !this.isCardChar() 
      && !this.hasPlayerAlreadySentCards()
      && ( this.isSelected(card) || notEnoughSelectedCards )
  }

  hasPlayerAlreadySentCards(): boolean {
    const chosenCardsSets = this.game()?.chosenCards ?? [];
    const currentUserId = this.userService.currentUser()?.id;
    return chosenCardsSets.some((cc: ChosenCards) => cc.playerId === currentUserId);
  }

  getGameState(): number | undefined {
    console.log(`gameService.nextRound()`);
    
    return this.game()?.state
  }

  isSelected = (card: Card): boolean => this.selectedCards().some((c: Card) => c.id === card.id);  
}
