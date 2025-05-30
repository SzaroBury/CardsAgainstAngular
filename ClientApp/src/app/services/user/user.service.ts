import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AppConfig } from 'src/app/config/config';
import { Observable, catchError, throwError, tap, map } from 'rxjs';
import { User } from '../../model/User';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser = signal<User | null>(null);
  isLogged = signal(false);

  constructor(
    private readonly http : HttpClient, 
    private readonly config : AppConfig, 
    private readonly router: Router
  ) { }

  getCurrentUser(source: string) : User | null {
    console.log(`UserService.getCurrentUser(source: ${source})`);
    return this.currentUser();
  }

  getUsername(userId: string): Observable<string> {
    console.log(`UserService.getUsername(userId: '${userId}')`);
    const api = this.config.get("PathAPI");
    return this.http.get<string>(`${api}user/${userId}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  joinRoom(roomId: string): void {
    console.log(`UserService.joinRoom(roomId: ${roomId})`);
    const user = this.currentUser();
    if(user) {
      user.joinedRoom = roomId;
      this.currentUser.set(user);
    }
  }

  leaveRoom(): void {
    console.log(`UserService.leaveRoom()`);

    const user = this.currentUser();
    if(user) {
      user.joinedRoom = '';
      this.currentUser.set(user);
      console.log("   User left the room");
    }
  }

  checkAuthentication(): void {
    console.log(`UserService.checkAuthentication()`);
    const userId = this.getUserIdFromToken();
    const username = this.getUsernameFromToken();
    if(userId && username) {
      console.log(`   Founded a locally stored user: { username: '${username}', userId: '${userId}' }`);
      this.refresh().subscribe({
        next: (newAccessToken: { newAccessToken: string }) => {
          if(newAccessToken) {
            const oldUser: User = {
              id: userId,
              name: username,
              joinedRoom: ''
            }
            this.currentUser.set(oldUser);
            this.isLogged.set(true);
          } else {
            this.logout();
          }  
        }
      })
    } else {
      console.log(`   Local user not found`);
      this.logout();
    }
  }

  login(username : string): Observable<void> {
    console.log(`UserService.login(username: '${username}')`);

    const headers = new HttpHeaders({'content-type': 'application/json'});
    const api = this.config.get("PathAPI");

    return this.http.post<{accessToken: string}>(`${api}login`, JSON.stringify(username), { headers, withCredentials: true })
    .pipe(
      tap( accessToken => { 
        this.saveAccessToken(accessToken.accessToken);
        console.log(`new access token: ${accessToken.accessToken}`);
        const userId = this.getUserIdFromToken();
        console.log(`userIdFromToken: ${userId}`);

        if(userId) {
          const newUser: User = {
            id: userId, 
            name:  username,
            joinedRoom: ''
          };
          this.currentUser.set(newUser);
          this.isLogged.set(true);
          this.router.navigate(["/"]);
        }

      }),
      map(() => void 0),
      catchError(this.handleError),
    );
  }

  logout(): void {
    console.log(`UserService.logout()`);

    if(this.currentUser()?.joinedRoom) {
      this.leaveRoom();
    }
    
    const api = this.config.get('PathAPI');
    this.http.post(
      `${api}logout`, 
      null, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleErrorDuringLogout),
    ).subscribe({
      next: () => {
        console.log("   Successfully logged out.");
        localStorage.setItem('accessToken', '');
        this.currentUser.set(null);
        this.isLogged.set(false);
      } 
    });
  }

  refresh(): Observable<{newAccessToken: string}> {
    console.log(`UserService.refresh()`);
    const api = this.config.get("PathAPI");
    return this.http.post<{newAccessToken: string}>(
      `${api}refresh`, 
      null, 
      { withCredentials: true }
    ).pipe(
      tap((newAccessToken) => {
        this.saveAccessToken(newAccessToken.newAccessToken);
      }),
      catchError(this.handleError)
    );
  }

  private saveAccessToken(token: string): void {
    // console.log(`UserService.saveAccessToken(token: '${token}')`);
    localStorage.setItem('accessToken', token);
  }

  private getUserIdFromToken(): string | null {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return null;
    }

    try {
      const decodedToken: { sub: string } = jwtDecode(accessToken);
      return decodedToken.sub;
    } catch (error) {
      console.error("Invalid token format:", error);
      return null;
    }
  }

  private getUsernameFromToken(): string | null {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return null;
    }

    try {
      const decodedToken: { unique_name: string } = jwtDecode(accessToken);
      return decodedToken.unique_name;
    } catch (error) {
      console.error("Invalid token format:", error);
      return null;
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    switch(error.status) {
      case 400:
        console.warn("UserService - Validation error: ", error.error.detail);
        return throwError(() => error.error.detail);
      case 401:
        console.warn("UserService - Unauthorized");
        this.logout();
        return throwError(() => "User unauthorized.");
      default:
        console.error("UserService - Unexpected error:", error);
        return throwError(() => "Something went wrong! Please try again.");
    }
  }

  private handleErrorDuringLogout = (error: HttpErrorResponse): Observable<never> => {
    switch(error.status) {
      case 400:
        console.warn("UserService - Validation error: ", error.error.detail);
        return throwError(() => error.error.detail);
      case 401:
        console.warn("UserService - Unauthorized");
        localStorage.setItem('accessToken', '');
        this.currentUser.set(null);
        this.isLogged.set(false);
        return throwError(() => "User unauthorized.");
      default:
        console.error("UserService - Unexpected error:", error);
        return throwError(() => "Something went wrong! Please try again.");
    }
  }
}