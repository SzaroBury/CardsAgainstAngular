import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit
{
  public username = "";
  public error_message = "";

  constructor(private userService : UserService, private router: Router) {  }

  ngOnInit(): void {
    if(this.userService.checkLocalStorage()) this.router.navigate(["/rooms"]);
  }

  login()
  {
    console.log("Login");
    this.error_message = "Loading ...";
    if (!this.username)
    {
      this.error_message = "Username cannot be empty.";
      return;
    }
    else
    {       
      this.userService.login(this.username).then((result) =>
      {
        localStorage.setItem("username", this.username);
        localStorage.setItem("userGuid", String(result));
        this.error_message = "";
        this.router.navigate(["/rooms"]);
      }).catch((error) => 
      {
        if (error instanceof HttpErrorResponse) 
        { 
          this.error_message = "Error: " + String(error.error).split('\n')[0].substring(18); 
          console.error("LoginComponentError: \n" + String(error.error));
        }
        else
        {
          this.error_message = "Unknown error"
          console.error("LoginComponentError: \n" + String(error));
        }
      });
    }
  }
}
