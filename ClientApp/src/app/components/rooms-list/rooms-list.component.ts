import { Component, Inject, OnInit, signal } from '@angular/core';
import { RoomService } from 'src/app/services/room/room.service';
import { UserService } from 'src/app/services/user/user.service';
import { Room, RoomState } from 'src/app/model/Room';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';

//List of rooms
//todo: leave room; refresh; private rooms - with password, watch mode
@Component({
    selector: 'app-rooms-list',
    templateUrl: './rooms-list.component.html',
    styleUrls: ['./rooms-list.component.css'],
    standalone: false
})
export class RoomsListComponent implements OnInit {
    rooms = signal<Room[]>([]);
    user = this.userService.getCurrentUser('RoomsListComponent init');
    isLoading = signal(true);
    newRoomName    = "";
    newRoomPlayers = 5;
    errorMessage      = "";

    constructor(
      private readonly roomService : RoomService,
      private readonly currentRoomService: CurrentRoomService,
      private readonly userService: UserService,
      private readonly router: Router
    ) { }

    ngOnInit(): void {
      this.loadRooms();
    }

    loadRooms(): void {
      this.roomService.getAllRooms().subscribe({
        next: response => { 
          this.isLoading.set(false);
          this.rooms.set(response);

        },
        error: e => { console.error("Error during loading rooms: ", e)}
      })
    }

    refresh(): void {
      this.rooms.set([]);
      this.user = this.userService.getCurrentUser('RoomsListComponent.refresh()');
      this.loadRooms();
    }

    addRoom(): void {
      if (this.newRoomName && this.user?.id) {
        this.roomService.addRoom(this.newRoomName, this.user?.id, this.newRoomPlayers)
        .subscribe({
          next: (room: Room) => {
            this.newRoomName = "";
            this.rooms.update(prevRooms => { 
              return [...prevRooms, room]
            });
            this.router.navigate(["room", room.id]);
          },
          error: err => this.errorMessage = err
        });
      }
    }

    deleteRoom(roomId: string): void {
      if(confirm("Are you sure you want to delete the room?")) {
        this.currentRoomService.leave()
        const index = this.rooms().findIndex(r => r.id == roomId);
        if (index > -1) {
          this.roomService.removeRoom(roomId).subscribe({
            next: () => { 
              this.rooms.update(prevRooms => {
                return prevRooms.filter((_, i) => i !== index);
              })
            }
          });
        }
      }
    }

    joinRoom(roomId: string): void {
      const user = this.userService.getCurrentUser('RoomsListComponent.joinRoom()');

      if(user?.joinedRoom) {
        if(!confirm('You will leave the room you are currently in? Are you sure you want to join a new room?')) {
          return;
        }
      }

      this.router.navigate(["room", String(roomId)])
    }

    leaveRoom(): void {
      this.currentRoomService.leave();
    }

    noRoomsToShow = (): boolean => 
      !this.isLoading()
        && this.rooms().length === 0;

    userHasNoRoom = (): boolean => 
      !this.isLoading()
        && !this.rooms().some(r => r.ownerId === this.user?.id);
    
    isUserInRoom = (r: Room) : boolean => 
      this.user?.id !== undefined 
      && r.users.some((pl) => pl.id === (this.user?.id ?? ''));

    roomStateToString = (state: number): string => 
      RoomState[state];
}