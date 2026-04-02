import { Injectable, EventEmitter } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiUrl;
  public currentUser: any = null;
  public authChanged = new EventEmitter<any>();

  constructor(private http: HttpClient) {}

  checkAuth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, { withCredentials: true }).pipe(
      tap((res: any) => {
        console.log("Réponse de /me :", res);
        if (res && res.code === "200") {
          this.currentUser = res.data;
          console.log("Utilisateur stocké dans le service :", this.currentUser);
          this.authChanged.emit(this.currentUser);
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

  getUserProgress(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return of(null);

    return this.http.get(`${this.apiUrl}/users/show-progress/${userId}`, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res && res.code === "200") {
          this.currentUser.progress = res.data;
        }
      }),
      catchError((err) => {
        console.error("Erreur récup progression:", err);
        return of(null);
      })
    );
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
