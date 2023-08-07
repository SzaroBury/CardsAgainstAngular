import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from 'src/app/config/config';
import { Observable, catchError, throwError, of } from 'rxjs';
import { Observer } from '../helpers/observer';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit
{
  private userGuid = "";
  private username = "";
  private observers: Observer[] = [];

  constructor(private http : HttpClient, private config : AppConfig) { }

  ngOnInit(): void 
  {
    this.checkLocalStorage();
  }

  checkLocalStorage(): boolean
  {
    let localUsername = localStorage.getItem("username");
    let localUserGuid = localStorage.getItem("userGuid");

    if(localUsername && localUserGuid)
    {
      this.userGuid = localUserGuid;
      this.username = localUsername;
      this.notify();
      return true;
    }
    else return false;
  }

  getUserGuid() : string{
    console.log("UserService: getUserGuid()");
    return this.userGuid;
  }

  getUsername() : string{
    console.log("UserService: getUsername()");
    return this.username
  }

  //check if username is available
  public checkUsername(username : string) 
  {    
    console.log("UserService: checkusername(" + username + ")");
    return new Promise<boolean>(resolve => 
    {
      this.http.get<boolean>(this.config.get("PathAPI") + "user/checkUsername/" + username)
      .pipe(
        catchError(this.handleErrorObservable)
      ).subscribe({
        next: result => { resolve(result); }
      });
    });
  }

  public login(username : string)
  {
    console.log("UserService: login(" + username + ")");
    let headers = new HttpHeaders({
      'content-type': 'application/json',
    });

    return new Promise((resolve, reject) => 
    {
      this.http.post<string>(this.config.get("PathAPI") + "addUser", JSON.stringify(username), { headers })
      .subscribe({ 
        next: responseGuid => { 
          this.userGuid = responseGuid; 
          this.username = username; 
          this.notify();
          resolve(responseGuid);
        },
        error: error => {
          reject(error);
        }
      })
    });
  }

  public checkIfLogged() : Observable<boolean>
  {
    console.log("UserService: checkIfLogged()");
    if(!this.userGuid || !this.username) return of(false);
    return this.http.get<boolean>(this.config.get("PathAPI") + "user/checkUserExistence/" + this.userGuid)
    .pipe(
      catchError(this.handleErrorObservable)
    );
  }

  /**
     * The subscription management methods.
     */
  public attach(observer: Observer): void 
  {
    console.log("UserService: attach(observer)");
    const isExist = this.observers.includes(observer);
    if (isExist) {
        return console.log('Subject: Observer has been attached already.');
    }

    console.log('Subject: Attached an observer.');
    this.observers.push(observer);
  }

  public detach(observer: Observer): void 
  {
    console.log("UserService: detach(observer)");
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
        return console.log('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    console.log('Subject: Detached an observer.');
  }

  /**
   * Trigger an update in each subscriber.
   */
  public notify(): void 
  {
      console.log('UserService: notify()');
      for (const observer of this.observers) {
          observer.update(this);
      }
  }

  private handleErrorObservable(error: any) {
    console.error("UserService error: " + (error.message || error));
    return throwError(error);
  } 
}


