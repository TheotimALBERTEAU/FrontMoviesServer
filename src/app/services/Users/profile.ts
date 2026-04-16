import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private ApiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserFavorites(userId: string): Observable<any> {
    return this.http.get(`${this.ApiUrl}/users/favorites/${userId}`, {})
  }

  getUserHistory(userId: string): Observable<any> {
    return this.http.get(`${this.ApiUrl}/users/history/${userId}`);
  }

  updateProfile(data: { userId: string, bannerColor?: string, profilePic?: string }): Observable<any> {
    return this.http.patch(`${this.ApiUrl}/users/update-profile`, data);
  }
}
