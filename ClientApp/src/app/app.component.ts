import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { Observer, Subject } from './helpers/observer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, Observer
{
  authentication: boolean = false;
  title = 'app';

  constructor(private userService : UserService) {}

  ngOnInit(): void 
  {
    this.update(this.userService);
    this.userService.attach(this);
  }

  update(subject: Subject): void
  {
    if (subject instanceof UserService) 
    {
      console.log('AppComponent: Reacted to the event.');
      this.userService.checkIfLogged().subscribe({
        next: result => { 
          this.authentication = result;
        } 
      });
    }
  }

}
