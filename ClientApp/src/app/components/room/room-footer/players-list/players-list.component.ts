import { Component, computed } from '@angular/core';
import { User } from 'src/app/model/User';
import { Player } from 'src/app/model/Game';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';
import { UserService } from 'src/app/services/user/user.service';
import { GameService } from 'src/app/services/current-room/game/game.service';

//todo: only owner can kick and not himself; owner can block player
@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.css'],
    standalone: false
})
export class PlayersListComponent {
  room = this.currentRoomService.getCurrentRoom();
  game = this.gameService.game;
  currentUser = this.userService.getCurrentUser('PlayersListComponent');

  constructor (
    private readonly currentRoomService: CurrentRoomService,
    private readonly gameService: GameService,
    private readonly userService: UserService
  ) {}

  getPlayerScore(userId: string): string {
    const players = this.game()?.players;
    if(players) {
      const playersScore = players.find((pl: Player) => pl.id == userId)?.score;
      if(playersScore) return String(playersScore)
      else             return "0";
    }
    return "-";
  }

  calculateUserName(user: User): string {
    let username = user.name
    
    if(this.room()?.ownerId === user.id) {
      username = username + "⚙️"
    }

    return username;
  }

  isOwner = (): boolean => 
    this.room()?.ownerId === this.currentUser?.id;
}
