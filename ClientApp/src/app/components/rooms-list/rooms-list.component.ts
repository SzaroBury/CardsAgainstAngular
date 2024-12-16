import { Component, Inject, OnInit } from '@angular/core';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';
import { Room, RoomState } from 'src/app/model/Room';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

//List of rooms
//todo: leave room; refresh; private rooms - with password, watch mode
@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.css']
})
export class RoomsListComponent implements OnInit
{
    public messages: string[] = [];
    public rooms: Room[]  = [];
    public userInput      = "";
    public messageInput   = "";
    public newRoomName    = "";
    public userGuid       = "";
    public username       = "{username}";
    public newRoomPlayers = 5;
    public roomError      = "";

    constructor(
      private roomService : RoomService,
      private userService: UserService,
      private router: Router
    ) { }

    ngOnInit()
    {
      this.username = this.userService.getUsername();
      this.userGuid = this.userService.getUserGuid();

      this.roomService.getAllRooms().subscribe({
        next: response => { this.rooms = response },
        error: e => { console.error("Error during loading rooms: " + String(e))}
      })
    }

    addRoom()
    {
      console.log("addRoom()");
      if (this.newRoomName && this.userGuid)
      {
        this.roomService.addRoom(this.newRoomName, this.userGuid, this.newRoomPlayers)
        .subscribe({
          next: room => {
            this.newRoomName = "";
            this.rooms.push(room);
            this.router.navigate(["room", String(room.guid)]);
          },
          error: error => {
            if(error instanceof HttpErrorResponse) this.roomError = String(error.error).split('\n')[0].substring(18);
            else this.roomError = "Unknown error";
            console.error("addRoom error: " + String(error))
          }
        });
      }
    }

    deleteRemove(roomId: string)
    {
      console.log("deleteRemove()");
      if(confirm("Are you sure you want to delete the room?")) 
      {
        const index = this.rooms.findIndex(r => r.guid == roomId);
        if (index > -1) {
          this.roomService.removeRoom(roomId).subscribe({
            next: () => { this.rooms.splice(index, 1); }
          });
        }
      }
    }

    enterRoom(roomId: string)
    {
      this.router.navigate(["room", String(roomId)])
    }

    leaveRoom(roomId: string)
    {
      
    }

    joinRoom(roomId: string)
    {
      console.log(`joinRoom(${roomId})`);
      this.roomService.joinRoom(roomId, this.userGuid).subscribe({
        next: () => {
          this.router.navigate(["room", String(roomId)]);
        },
        error: error => {
          if(error instanceof HttpErrorResponse) this.roomError = String(error.error).split('\n')[0].substring(18);
          else this.roomError = "Unknown error";
          console.error("addRoom error: " + String(error))
        }
      });
      
    }

    noRoomsToShow(): boolean
    {
      return this.rooms.length == 0;
    }

    userHasNoRoom(): boolean 
    {
      // console.log("userHasSomeRoom()");
      return !this.rooms.some(room => room.ownerGuid == this.userGuid);
    }

    roomStateToString(state: number): string
    {
      return RoomState[state];
    }

    isUserInRoom(r: Room) : boolean
    { 
      return r.users.some((pl) => pl.id === this.userGuid);
    }
}

