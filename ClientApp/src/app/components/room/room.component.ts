import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RoomService } from 'src/app/services/room.service';
import { Room } from 'src/app/model/Room';
import { User } from 'src/app/model/User';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { Sentence, Card, ChosenCards, Game } from 'src/app/model/Game';
import { AppConfig } from 'src/app/config/config';

//whole game; watch mode; change color of inputs when their values make starting game not available
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit
{
  @Input() guid: string = "";
  public room$ = new BehaviorSubject<Room|null>(null); 
  public userGuid = "";
  public connection: HubConnection = new HubConnectionBuilder().withUrl(this.config.get("PathAPI") + 'hub/room').build();

  constructor(
    private config: AppConfig,
    private roomService: RoomService,
    private userService: UserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void 
  {
    this.userGuid = this.userService.getUserGuid();
    this.route.params.subscribe(params => {
      this.guid = params['guid'];
      this.roomService.getRoom(this.guid).subscribe(this.room$); 
      this.initWebSocket();
    });  
  }

  isUserRoomOwner(room: Room): boolean
  {
    // console.log("isUserRoomOwner( " + room.ownerGuid + " )");
    return room.ownerGuid === this.userGuid   
  }

  isUserRoomPlayer(players: User[]): boolean
  {
    //console.log("isUserRoomPlayer("+this.userGuid+")
    return players.some(player => player.id === this.userGuid)
  }

  newGame(input: [number, number, Sentence[], Card[]])
  {
    const cardsInHand = input[0]; 
    const scoreToWin = input[1];
    const sentences = input[2];
    const cards = input[3];
    console.log("game-room: newGame(" + cardsInHand + ", " + scoreToWin + ", sentences(" + sentences.length + "), cards(" + cards.length + "))");
    
    //todo: send new status of the room to players
    // this.connection.invoke("NewGame", this.guid, cardsInHand, scoreToWin, sentences, cards); //todo not working

    //todo: loading panel

    //todo: send request to create a new game (cards and sentences); to check if changes in game-config component are visible in this component
    let new_room: any;
    this.roomService.newGame(this.guid, cardsInHand, scoreToWin, sentences, cards).subscribe(new_room);
  }

  logOnConsole(text: any)
  {
    console.log(text);
  }

  initWebSocket() {
    this.connection.on('messageReceived', (from: string, body: string) => 
    {
      console.log("RoomHub: messageReceived ( from: " + from + ", body: " + body + " )");
      //handle message
    });

    this.connection.on('userJoined', userGuid => 
    {
      console.log("RoomHub: userJoined( userGuid: " + userGuid + " )");
      // this.roomService.getRoom(this.guid).subscribe(this.room$); 
      this.roomService.getRoomUserList(this.guid).subscribe((users: User[]) => 
      {
        const currentRoom = this.room$.getValue();
        if (currentRoom && users) {
          currentRoom.users = users;
        }
        this.room$.next(currentRoom);
      });
    });

    this.connection.on('userLeft', user => 
    {
      console.log("RoomHub: userLeft( user: " + user + " )");
    });

    this.connection.on('newGame', (changedGame: Game) =>
    {
      console.log("RoomHub: newGame");
      let currentRoom = this.room$.getValue();
      if(currentRoom){
        changedGame.cardsConfirmed = false;
        currentRoom.state = 1;
        currentRoom.game = changedGame;
        this.room$.next(currentRoom);        
      } 
    });

    this.connection.on('cardsConfirmed', () =>
    {
      console.log("RoomHub: cardsConfirmed");
      let currentRoom = this.room$.getValue();
      if(currentRoom){
        const newCardSet = new ChosenCards();
        for(let i = 0; i < currentRoom.game.currentSentence.blankFields; i++)
        {
          newCardSet.cards.push({ id: -1, value: "blank" })
        }
        currentRoom.game.chosenCards.push(newCardSet);
        this.room$.next(currentRoom);        
      } 
    });

    this.connection.on('showCards', (cardsSets: ChosenCards[]) =>
    {
      console.log("RoomHub: showCards");
      let currentRoom = this.room$.getValue();
      if(currentRoom){
        currentRoom.game.chosenCards = cardsSets;
        currentRoom.game.state = 1;
        this.room$.next(currentRoom);        
      } 
    });

    this.connection.on('showWinner', (changedGame: Game) =>
    {
      console.log("RoomHub: newGameStarted");
      let currentRoom = this.room$.getValue();
      if(currentRoom){
        currentRoom.game = changedGame;
        this.room$.next(currentRoom);        
      } 
    });

    this.connection.on('nextRound', (changedGame: Game) =>
    {
      console.log("RoomHub: nextRound");
      let currentRoom = this.room$.getValue();
      if(currentRoom){
        changedGame.cardsConfirmed = false;
        currentRoom.game = changedGame;
        this.room$.next(currentRoom);        
      } 
    });

    this.connection.on('gameFinished', (changedGame: Game) =>
    {
      console.log("RoomHub: gameFinished");
      let currentRoom = this.room$.getValue();
      if(currentRoom){
        currentRoom.game = changedGame;
        currentRoom.state = 2;
        this.room$.next(currentRoom);        
      } 
    });

    this.connection.start().then(() => 
    {
      this.connection.invoke("Join", this.guid, this.userGuid);
    });
  }

  test(state: any)
  {
    return state === 0;
  }
}
