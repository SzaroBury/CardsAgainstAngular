import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../../config/config';
import { catchError, Observable, throwError } from 'rxjs';
import { Deck } from '../../model/Deck';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private pathAPI = this.config.get("PathAPI");

  constructor(
    private readonly http: HttpClient, 
    private readonly config: AppConfig,
    private readonly userService: UserService
  ) { }

  public getAllDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(this.pathAPI + "decks")
    .pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    switch(error.status) {
      case 400:
        console.warn("DeckService - Validation error: ", error.error.detail);
        return throwError(() => error.error.detail);
      case 401:
        console.warn("DeckService - Unauthorized");
        this.userService.logout();
        return throwError(() => "User unauthorized.");
      default:
        console.error("DeckService - Unexpected error:", error);
        return throwError(() => "Something went wrong! Please try again.");
    }
  } 
}
