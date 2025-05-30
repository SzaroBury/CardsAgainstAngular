import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user/user.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent implements OnInit
{
  authenticated = this.userService.isLogged;
  title = 'app';

  constructor(
    private userService : UserService
  ) {}

  ngOnInit(): void {
    this.userService.checkAuthentication();
  }
}