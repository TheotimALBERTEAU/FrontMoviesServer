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

  getGenreMetadata(genreName: string): Observable<any> {
    return this.getMoviesByGenre(genreName).pipe(
      map(res => {
        const movies = res.data || [];
        return {
          id: genreName.toLowerCase(),
          label: genreName,
          count: movies.length,
          cover: movies.length > 0 ? movies[0].cover : 'Assets/Movies/default-cover.png'
        };
      })
    );
  }

}
