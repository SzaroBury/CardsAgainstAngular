import { Component, Input } from '@angular/core';
import { User } from 'src/app/model/User';
import { Player } from 'src/app/model/Game';
import { Room } from 'src/app/model/Room';

//todo: only owner can kick and not himself; owner can block player
@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent {
  @Input() room?: Room;
  @Input() userId: string = "";
  @Input() isOwner: boolean = false;

  constructor () 
  { 
  }

  getPlayerScore(userId: string)
  {
    if(this.room?.game)
    {
      const result = this.room?.game.players.find((pl: Player) => pl.id == userId)?.score;
      if(result) return result;
      else return "0";
    }
    return "-";
  }

  calculateUserName(user: User): string
  {
    let result = user.name
    
    if(this.room?.ownerGuid === user.id)
    {
      result = result + "⚙️"
    }

    return result;
  }

}
