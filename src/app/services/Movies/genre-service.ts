import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMoviesByGenre(genre: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/movies/${genre}`);
  }

  getSeriesByGenre(genre: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/series/${genre}`);
  }

  getGenreMetadata(genreName: string): Observable<any> {
    return this.getMoviesByGenre(genreName).pipe(
      map(res => {
        const movies = res.data || [];
        const count = movies.length;

        let randomCover = 'Assets/Movies/default-cover.png';
        if (count > 0) {
          // Génère un index entre 0 et (nombre de films - 1)
          const randomIndex = Math.floor(Math.random() * count);
          randomCover = movies[randomIndex].cover;
        }
        return {
          id: genreName.toLowerCase(),
          label: genreName,
          count: movies.length,
          cover: randomCover,
        };
      })
    );
  }

}
