import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { AppConfig } from '../config/config';
import { Observable, catchError, throwError } from 'rxjs';
import { Room } from '../model/Room';
import { Card, Sentence } from '../model/Game';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class RoomService implements OnInit
{
  private pathAPI = this.config.get("PathAPI");

  constructor(private http : HttpClient, private config : AppConfig) { }

  ngOnInit(): void {
  }

  public getAllRooms() : Observable<Room[]>
  {
    return this.http.get<Room[]>(this.pathAPI + "rooms")
    .pipe(
      catchError(this.handleErrorObservable)
    );
  }

  public getRoom(roomId: string): Observable<Room>
  {
    return this.http.get<Room>(this.pathAPI + "room/" + String(roomId))
    .pipe(
      catchError(this.handleErrorObservable)
    );
  }

  public getRoomUserList(roomId: string): Observable<User[]>
  {
    return this.http.get<User[]>(this.pathAPI + "room/" + String(roomId) + "/users")
    .pipe(
      catchError(this.handleErrorObservable)
    );
  }

  public removeRoom(roomId: string)
  {
    return this.http.delete<Room>(this.pathAPI + "room/" + String(roomId))
    .pipe(
      catchError(this.handleErrorObservable)
    );
  }

  public addRoom(name : string, userGuid : string, maxPlayers : number) : Observable<Room>
  {
    return this.http.post<Room>(this.pathAPI +  "room", { Name: name, UserGuid: userGuid, MaxPlayers: maxPlayers })
    .pipe(
      catchError(this.handleErrorObservable)
    );
  }

  public joinRoom(roomGuid: string, userGuid: string)
  {
    console.log("roomService.joinRoom(" + roomGuid + ", " + userGuid + ")");
    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.post(this.pathAPI + "room/" + String(roomGuid) + "/join", JSON.stringify(userGuid), { headers })
    .pipe(
      catchError(this.handleErrorObservable)
    );
  }

  public newGame(roomGuid: string, cardsInHand: number, scoreToWin: number, sentences: Sentence[], cards: Card[])
  {
    console.log("roomService.newGame(" + roomGuid + ", " + cardsInHand + ", " + scoreToWin + ")");
    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.post(this.pathAPI + "room/" + String(roomGuid) + "/NewGame", { CardsInHand: cardsInHand, ScoreToWin: scoreToWin, Sentences: sentences, Cards: cards }, { headers })
    .pipe(
      catchError(this.handleErrorObservable)
    );
  }

  private handleErrorObservable(error: any) {
    console.error("RoomService error: " + (error.message || error));
    return throwError(error);
  } 
}
