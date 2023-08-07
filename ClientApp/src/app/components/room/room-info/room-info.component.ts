import { Component, Input } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { GameState } from 'src/app/model/Game';
import { Room, RoomState } from 'src/app/model/Room';

@Component({
  selector: 'app-room-info',
  templateUrl: './room-info.component.html',
  styleUrls: ['./room-info.component.css']
})
export class RoomInfoComponent {
  @Input() room?: Room;
  @Input() userId: string = "";
  @Input() connection?: HubConnection;

  calculateRound(): string
  {
    if(this.room && this.room.game)
    {
      return (this.room.game.round + 1).toString();
    }
    return "-";
  }

  roomStateToString(state?: number): string
  {
    return state ? RoomState[state] : " - ";
  }

  gameStateToString(): string
  {
    return this.room?.game ? GameState[this.room.game.state] : "-";
  }

  players(): string
  {
    if(this.room)
    {
     if(this.room.game) return this.room.game.players.length + " / "  + this.room.maxPlayers; 
     
     return "- / "  + this.room.maxPlayers;
    }
    return "- / -";
  }

  calculateScoreToWin(): string
  {
    return this.room?.game ? this.room.game.scoreToWin.toString() : "-";
  }

  showFinishedButtons(): boolean
  {
    if(this.room?.game && this.room?.game.state === 3 && this.room.ownerGuid === this.userId) return true;
    return false;
  }

  newGame()
  {
    this.connection?.invoke("NewGame", this.room?.guid);
  }

  editNewGame()
  {
    if(this.room)
    {
      this.room.game.state = 0;
      this.room.state = 0;
    }
  }
}