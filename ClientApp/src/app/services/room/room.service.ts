import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable, catchError, throwError } from 'rxjs';
import { UserService } from '../user/user.service';
import { AppConfig } from '../../config/config';
import { RoomDto } from 'src/app/model/RoomDto';
import { Sentence} from '../../model/Sentence'; 
import { Injectable } from '@angular/core';
import { Room } from '../../model/Room';
import { Card } from '../../model/Card'; 

@Injectable({ providedIn: 'root' })
export class RoomService
{
  private api = this.config.get("PathAPI");

  constructor(
    private readonly http: HttpClient, 
    private readonly config: AppConfig,
    private readonly userService: UserService,
  ) { }

  public getAllRooms(): Observable<Room[]> {
    console.log('roomService.getAllRooms()');

    return this.http.get<Room[]>(
      `${this.api}rooms`, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public getRoom(roomId: string): Observable<RoomDto> {
    console.log(`roomService.getRoom(roomId: '${roomId}')`);

    return this.http.get<Room>(
      `${this.api}room/${roomId}`, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public addRoom(name: string, userId: string, maxPlayers: number): Observable<Room> {
    console.log(`roomService.addRoom(name: '${name}', userId: '${userId}', maxPlayers: ${maxPlayers})`);

    return this.http.post<Room>(
      `${this.api}room`, 
      { Name: name, UserId: userId, MaxPlayers: maxPlayers }, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public removeRoom(roomId: string) {
    console.log(`roomService.removeRoom(roomId: '${roomId}')`);

    return this.http.delete<Room>(
      `${this.api}room/${roomId}`, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public loadDeck(roomId: string, deckId: string): Observable<Room | never> {
    console.log(`roomService.loadDeck(roomId: '${roomId}', deckId: '${deckId})'`);

    return this.http.put<Room>(
      `${this.api}room/${roomId}/load/${deckId}`, 
      null, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError) 
    );
  }

    public removeDeck(roomId: string, deckId: string): Observable<Room | never> {
    console.log(`roomService.removeDeck(roomId: '${roomId}', deckId: '${deckId})'`);

    return this.http.put<Room>(
      `${this.api}room/${roomId}/remove/${deckId}`, 
      null, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError) 
    );
  }

  public newCard(roomId: string, content: string) {
    console.log(`roomService.newCard(roomId: '${roomId}', content: '${content}')`);

    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.post<Card>(
      `${this.api}room/${roomId}/cards`, 
      { content: content }, 
      { headers, withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public removeCard(roomId: string, cardId: string) {
    console.log(`roomService.removeCard(roomId: '${roomId}', cardId: '${cardId}')`);

    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.delete(
      `${this.api}room/${roomId}/cards/${cardId}`, 
      { headers, withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public clearCards(roomId: string) {
    console.log(`roomService.clearCards(roomId: '${roomId}')`);

    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.delete(
      `${this.api}room/${roomId}/cards`, 
      { headers, withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public newSentence(roomGuid: string, content: string, blankSpaces: number) {
    console.log(`roomService.newSentence(roomGuid: '${roomGuid}', content: '${content}')`);

    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.post<Sentence>(
      `${this.api}room/${roomGuid}/sentences`, 
      { content, blankSpaces }, 
      { headers, withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public removeSentence(roomId: string, sentenceId: string) {
    console.log(`roomService.removeSentence(roomId: '${roomId}', sentenceId: '${sentenceId}')`);

    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.delete(
      `${this.api}room/${roomId}/sentences/${sentenceId}`, 
      { headers, withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public clearSentences(roomId: string) {
    console.log(`roomService.clearSentences(roomId: '${roomId}')`);

    const headers = new HttpHeaders({'content-type': 'application/json'});
    return this.http.delete(
      `${this.api}room/${roomId}/sentences`, 
      { headers, withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  public getPlayerHand(): Observable<Card[]> {
    console.log(`roomService.getPlayerHand()`);

    return this.http.get<Card[]>(
      `${this.api}room/hand`, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    switch (error.status) {
      case 400:
        if (error.error.errors) {
          console.warn("RoomService - Validation error: ", error.error.detail);
          return throwError(() => error.error.detail);
        }
        break;
      case 401:
        this.userService.logout();
        console.warn("RoomService - Unauthorized");
        return EMPTY; 
      default:
        console.error("RoomService - Unexpected error:", error);
    }

    return throwError(() => 'Something went wrong!');
  }
}
