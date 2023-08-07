import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Observer, Subject } from 'src/app/helpers/observer';
import { UserService } from 'src/app/services/user.service';

//todo: move "Login as" and "Logout" to right
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit, Observer
{
  isExpanded = false;
  username = "";
  authentication = false;

  constructor(private userService: UserService ) { }

  ngOnInit(): void 
  {
    this.userService.attach(this); 
    this.update(this.userService);
  }

  update(subject: Subject) 
  {
    if (subject instanceof UserService) 
    {
      console.log('NavMenuComponent: Reacted to the event.');
      this.userService.checkIfLogged().subscribe({
        next: result => { 
          this.authentication = result;
          this.username = this.userService.getUsername();
        } 
      });
    }
  }

  logout()
  {
    console.log("logout");
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
