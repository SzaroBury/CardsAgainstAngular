import { Component } from '@angular/core';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';
import { UserService } from 'src/app/services/user/user.service';

//todo: move "Login as" and "Logout" to right
@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.css'],
    standalone: false
})
export class NavMenuComponent {
  user = this.userService.currentUser;
  isLogged = this.userService.isLogged;
  isExpanded = false;

  constructor(
    private readonly userService: UserService,
    private readonly currentRoomService: CurrentRoomService
  ) { }

  logout(): void {
    if(this.user()?.joinedRoom) {
      this.currentRoomService.leave()
    }
    this.userService.logout();
  }

  collapse(): void {
    this.isExpanded = false;
  }

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }
}
