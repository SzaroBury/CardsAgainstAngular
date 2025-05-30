import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { Subject } from 'rxjs';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { AppConfig } from 'src/app/config/config';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';

//whole game; watch mode; change color of inputs when their values make starting game not available
@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.css'],
    standalone: false
})
export class RoomComponent implements OnInit, OnDestroy {
  room = this.currentRoomService.getCurrentRoom();
  // users = this.room()?.users;
  private destroy$ = new Subject<void>(); 

  constructor(
    private readonly currentRoomService: CurrentRoomService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const roomId = params['guid'];
      this.currentRoomService.loadRoom(roomId); 
    });  
  }

  ngOnDestroy(): void {
    this.destroy$.next();  // Emit value to unsubscribe all subscriptions
    this.destroy$.complete();  // Complete the destroy$ subject
    this.currentRoomService.leave();
  }

  isOwner = (): boolean => {
    const userId = this.userService.currentUser()?.id;
    const ownerId = this.room()?.ownerId;
    return userId === ownerId;
  }

  isInRoom(): boolean {
    const userId = this.userService.currentUser()?.id;
    return this.room()?.users?.some(user => user.id === userId) ?? false;
  }
}