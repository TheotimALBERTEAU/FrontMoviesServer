import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Favorites {
  private ApiUrl = environment.apiUrl;

  // On garde les IDs en mémoire ici
  public favoriteIds: Set<string> = new Set();

  constructor(private http: HttpClient) {}

  loadFavorites(userId: string): void {
    this.getUserFavorites(userId).subscribe(res => {
      this.favoriteIds = new Set(res.data.map((fav: any) => fav.id));
    });
  }

  getUserFavorites(userId: string): Observable<any> {
    return this.http.get(`${this.ApiUrl}/users/favorites/${userId}`);
  }

  toggleFavorite(userId: string, mediaId: string, mediaType: 'Movies' | 'Series' | 'Animes'): Observable<any> {
    return this.http.post(`${this.ApiUrl}/users/toggle-favorite`, {
      userId,
      mediaId,
      mediaType
    });
  }

  isFavorite(mediaId: string): boolean {
    return this.favoriteIds.has(mediaId);
  }
}
