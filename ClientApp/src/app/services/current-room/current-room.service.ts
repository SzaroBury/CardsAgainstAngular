import { Injectable, Signal, signal } from '@angular/core';
import { Message, Room } from '../../model/Room';
import { Card } from '../../model/Card'; 
import { RoomService } from '../room/room.service';
import { ChosenCards, Game} from 'src/app/model/Game';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AppConfig } from 'src/app/config/config';
import { UserService } from '../user/user.service';
import { User } from 'src/app/model/User';
import { Router } from '@angular/router';
import { GameService } from './game/game.service';
import { SentencesConfigService } from './sentences-config/sentences-config.service';
import { concatMap, from, throwError } from 'rxjs';
import { CardsConfigService } from './cards-config/cards-config.service';
import { RoomDto } from 'src/app/model/RoomDto';

@Injectable()
export class CurrentRoomService {
  private connection: HubConnection = new HubConnectionBuilder().withUrl(`${this.config.get("PathAPI")}hub/room`).build();
  private user = this.userService.currentUser;
  room = signal<Room | null>(null);
  scoreToWin = signal(10);
  cardsPerHand = signal(3);
  messages = signal<Message[]>([]);
  errorMessage = "";
  
  constructor(
    private readonly roomService: RoomService, 
    private readonly userService: UserService,
    private readonly gameService: GameService,
    private readonly sentencesConfigService: SentencesConfigService,
    private readonly cardsConfigService: CardsConfigService,
    private readonly config: AppConfig,
    private readonly router: Router
  ) {
    this.sentencesConfigService.setRoom(this.room);
    this.cardsConfigService.setRoom(this.room);
  }

  loadRoom(roomId: string): void {
    console.log(`currentRoomService.loadRoom(roomId: '${roomId}')`);
    this.connection.stop();
    this.messages.set([]);

    this.roomService.getRoom(roomId).subscribe({
      next: room => {
        const oldMessages = this.room()?.messages ?? [];
        const mappedRoom = this.mapRoomDtoToRoom(room, oldMessages);
        this.room.set(mappedRoom);
        if(room.game) {
          this.gameService.loadGame(room.game);
        }

        if(!this.connection) {
          console.error("HubConnection is not initialized!");
        } else {
          this.initWebSocket();
        }
      }
    });
  }

  getCurrentRoom(): Signal<Room | null> {
    return this.room;
  }

  newGame(cardsInHand: number, scoreToWin: number): void {
    console.log(`currentRoomService.newGame(cardsInHand: ${cardsInHand}, scoreToWin: ${scoreToWin})`);

    const roomId = this.room()?.id;
    if(roomId) {
      this.connection.invoke("NewGame", roomId, cardsInHand, scoreToWin);
    }
  }

  initWebSocket(): void {
    this.gameService.initWebSocket(this.connection);
    this.sentencesConfigService.initWebSocket(this.connection);
    this.cardsConfigService.initWebSocket(this.connection);

    this.connection.on('userJoined', (user: User) => {
      console.log("RoomHub: userJoined(user: '" + user.id + "')");
      const room = this.room();
      const currentUserId = this.user()?.id;

      if(room) {
        if(!room?.users.some(u => u.id == user.id)) {
          const currentRoomUsers = room.users;
          room!.users = [...currentRoomUsers, user];
          this.room.set(room);
          this.userService.joinRoom(room.id);
          if(currentUserId !== user.id) {
            this.showOnLog(`${user.name} joined the room.`);
          }
        }
      }
    });

    this.connection.on('userLeft', (user: User) => {
      console.log(`RoomHub: userLeft(username: '${user.name}' userId: ${user.id})`);
      const currentUserId = this.userService.currentUser()?.id;
      const room = this.room();

      if(currentUserId && room) {
        if(currentUserId === user.id) {
          this.userService.leaveRoom();
          this.router.navigate(['rooms']);
          this.room.set(null);
          this.messages.set([]);
          this.connection.stop();
        } else {
          if(room) {
            const users = this.room()?.users.filter(u => u.id !== user.id);
            if(users) {
              room.users = users;
              if(users.length < 4) {
                room.state = 0;
              }
              this.room.set(room);
              this.showOnLog(`${user.name} left the room.`);
            }
          }
        }
      } else {
        console.error('if currentUserId && room');
      }      
    });

    this.connection?.on('newMessage', (message: Message) => {
      console.log(`RoomHub: newMessage(id: '${message.id}' userId: '${message.userId}',  created: ${message.created}, content: '${message.content}')`);
      this.messages.update(oldMessages => [...oldMessages, message])
    });

    this.connection.on('newGameStarted', (game: Game, hand: Card[]) => {
      console.log(`RoomHub.newGameStarted()`);
      this.showOnLog('New game has been started');

      if(this.room() && game && hand) {
          this.gameService.newGameStarted(game, hand)
          this.room.update((room) => {
            if(room) {
              room.state = 1
            }
            return room;
          });
        } else {
          console.error('   if(game && hand)');
        }
    });

    this.connection.on('cardsConfirmed', (chosenCards) => {
      console.log("RoomHub: cardsConfirmed()", chosenCards);
      const game = this.gameService.game;
      const blankFields = game()?.currentSentence.blankFields;
      if(blankFields) {
        const newCardSet = new ChosenCards(chosenCards.id, chosenCards.playerId, blankFields);
        game.update((g) => {
          if(g) {
            g.chosenCards.push(newCardSet);
          }
          return g;
        });
      } 
    });

    this.connection.on('showCards', (cardsSets: ChosenCards[]) => {
      console.log("RoomHub: showCards(cardsSets: )", cardsSets);
      this.gameService.game.update((game) => {
        if(game) {
          game.chosenCards = cardsSets;
          game.state = 2;
        }
        return game;
      }) 
    });

    this.connection.on('showWinner', (choosedAnswerId: string) => {
      console.log(`RoomHub: showWinner(choosedAnswerId: ${choosedAnswerId})`);
      this.gameService.game.update((game) => {
        if(game) {
          game.state = 3;
          const setThatWon = game?.chosenCards.find(set => set.id === choosedAnswerId);
          if(setThatWon) {
            setThatWon.winner = true;
            const playerIdThatWon = setThatWon.playerId;
            const player = game?.players.find(p => p.id === playerIdThatWon);
            if(player && player.score >= 0) {
              player.score = player.score + 1;
            }
          }
        }
        return game;
      })
    });

    this.connection.on('nextRoundStarted', (hand: Card[], currentSentenceId: string, chooserId: string) => {
      console.log("RoomHub: nextRoundStarted");
      
      const nextSentence = this.room()?.sentences.find(s => s.id === currentSentenceId);
      if(hand && nextSentence && chooserId) {
        this.gameService.nextRoundStarted(hand, nextSentence, chooserId);

        this.room.update((room) => {
          if(room) {  
            room.state = 1;
          }
          return room;      
        })
      } else {
        console.error("Sentence was not find in the room.");
      }
    });

    this.connection.on('gameFinished', (choosedAnswerId: string) => {
      console.log("RoomHub: gameFinished", choosedAnswerId);
      this.gameService.game.update((game) => {
        if(game) {
          const setThatWon = game?.chosenCards.find(set => set.id === choosedAnswerId);
          if(setThatWon) {
            setThatWon.winner = true;
            const playerIdThatWon = setThatWon.playerId;
            const player = game?.players.find(p => p.id === playerIdThatWon);
            console.log(player);

            if(player && player.score >= 0) {
              player.score = player.score + 1;
            }

            game.state = 4
          }
        }
        return game;
      });

      this.room.update((room) => {
        if(room) {
          room.state = 2;
        }
        return room;
      })
    });

    this.connection.start().then(() => {
      const roomId = this.room()?.id;
      const userId = this.user()?.id;
      if(roomId && userId) {
        this.connection.invoke("Join", roomId, userId)
        .then(() => {
          this.userService.joinRoom(roomId)
          this.showOnLog('Connected to the room.');
        }).catch(error => console.error('Connection error', error));
      } else {
        console.error("Error during connecting to the room.");
        this.router.navigate(["room", String(roomId)]);
      }
    });
  }

  sendMessage(content: string): void {
    console.log(`currentRoomService.sendMessage(content: '${content}')`);

    const mess = new Message();
    mess.content = content;
    mess.systemLog = false;
    mess.userId = this.user()?.id ?? "??";
    this.connection?.invoke("SendMessage", this.room()?.id, mess);
  }

  showOnLog(content: string): void {
    console.log(`currentRoomService.showOnLog(content: '${content}')`);

    const mess = new Message();
    mess.id = this.messages().length.toString();
    mess.content = content;
    mess.systemLog = true;
    this.messages.update(oldMessages => [...oldMessages, mess])
  }

  leave(): void {
    console.log(`currentRoomService.leave()`);

    const user = this.user();

    if(user?.joinedRoom) {
      if(user.id) {
        this.connection.invoke("Leave", user.joinedRoom, user.id);
      } else {
        console.error('   Error: userId is empty');
      }
    } else {
      console.error('   Error: roomId is empty');
    }
  }

  editNewGame(): void {
    console.log(`currentRoomService.editNewGame()`);
    this.gameService.game.update((game) => {
      if(game) {
        game.state = 0;
      }
      return game;
    });

    this.room.update((room) => {
      if(room) {
        room.state = 0;
      }
      return room;
    });
  }

  //game-config
  loadDeck(deckId: string): void {
    console.log(`CurrentRoomService.loadDeck(deckId: '${deckId}')`);
    const room = this.room();
    this.roomService.loadDeck(room?.id ?? "??", deckId).subscribe({
      next: (response: Room) => this.room.set(response),
      error: err => throwError(() => new Error(err))
    })
  }

  loadDecks(deckIds: string[]): void {
    console.log(`CurrentRoomService.loadDecks(deckIds.length: '${deckIds.length}')`);
    if (!deckIds.length) return;
    let lastRoom: Room | null = null;
    from(deckIds).pipe(
      concatMap(deckId => this.roomService.loadDeck(this.room()?.id ?? "??", deckId))
    ).subscribe({
      next: (room: Room) => { lastRoom = room; },
      complete: () => { if (lastRoom) this.room.set(lastRoom); }
    });
  }

  removeDeck(deckId: string): void {
    console.log(`CurrentRoomService.removeDeck(deckId: '${deckId}')`);
    const room = this.room();
    this.roomService.removeDeck(room?.id ?? "??", deckId).subscribe({
      next: (response: Room) => this.room.set(response),
      error: err => throwError(() => new Error(err))
    })
  }

  isRoomOwner(): boolean {
    const roomOwnerId = this.room()?.ownerId;
    const currentUserId = this.user()?.id;
    if(roomOwnerId && currentUserId) {
      return roomOwnerId === currentUserId;
    } else {
      return false;
    }
  }

  mapRoomDtoToRoom(roomDto: RoomDto, oldMessages: Message[]): Room {
    const room = new Room();
    Object.assign(room, roomDto);
    room.messages = oldMessages;
    return room;
  }
}