import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiUrl;
  public currentUser: any = null;

  constructor(private http: HttpClient) {}

  checkAuth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, { withCredentials: true }).pipe(
      tap((res: any) => {
        console.log("Réponse de /me :", res);
        if (res && res.code === "200") {
          this.currentUser = res.data;
          console.log("Utilisateur stocké dans le service :", this.currentUser);
        } else {
          this.currentUser = null;
        }
      }),
      catchError((err) => {
        console.error("Erreur Auth:", err);
        this.currentUser = null;
        return of(null);
      })
    );
  }

  getUserId(): string | null {
    return this.currentUser ? this.currentUser.id : null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUser = null;
        console.log("Utilisateur déconnecté localement");
      }),
      catchError((err) => {
        this.currentUser = null;
        return of(null);
      })
    );
  }
}
