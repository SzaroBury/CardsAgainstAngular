import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent
{
  username = "";
  errorMessage = "";

  constructor(
    private userService : UserService
  ) {}

  login(): void {
    if (!this.username) {
      this.errorMessage = "Username cannot be empty.";
      return;
    }

    this.errorMessage = '';

    this.userService.login(this.username).subscribe({
      error: err => this.errorMessage = err
    });
  }
}
