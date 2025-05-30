import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, switchMap } from "rxjs";
import { UserService } from "../services/user/user.service";
import { jwtDecode } from "jwt-decode";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith('https://localhost:7214/api')) {
      return next.handle(req);
    }
    
    console.log("   intercepting", req.url);
    const accessToken = localStorage.getItem('accessToken');
    
    if(accessToken) {
      const expirationInMinutes = this.getRemainingTokenTimeInMinutes(accessToken);
      if(expirationInMinutes !== null
        && expirationInMinutes < 1 
        && !req.url.endsWith('/api/refresh')
        && !req.url.endsWith('/api/login')
        && !req.url.endsWith('/api/logout')
      ) {
        console.log(`   Token will expire in ${expirationInMinutes} minutes. Refreshing tokens.`);
        return this.userService.refresh().pipe(
          switchMap((newAccessToken: { newAccessToken: string }) => {
            const clonedRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken.newAccessToken}` }
            });
            return next.handle(clonedRequest);
          })
        );
      }

      const clonedRequest = req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` }
      });

      return next.handle(clonedRequest);
    } else {
      return next.handle(req);
    }
  }

  private getRemainingTokenTimeInMinutes(token: string): number | null {
    try {
      const decoded: any = jwtDecode(token);
      const expiration = decoded.exp * 1000;
      return ((expiration - Date.now()) / 60 / 1000);
    } catch (error) {
      console.error("   Error decoding token:", error);
      return null;
    }
  }
}
