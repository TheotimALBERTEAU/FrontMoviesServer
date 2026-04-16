import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
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

  getAnimesByGenre(genre: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/animes/${genre}`);
  }

  getGenreMetadata(genreName: string): Observable<any> {
    // On appelle les 3 méthodes locales en parallèle
    return forkJoin({
      movies: this.getMoviesByGenre(genreName),
      series: this.getSeriesByGenre(genreName),
      animes: this.getAnimesByGenre(genreName)
    }).pipe(
      map(res => {
        // Extraction des listes (ou tableau vide si data est undefined)
        const movies = res.movies?.data || [];
        const series = res.series?.data || [];
        const animes = res.animes?.data || [];

        // Calcul du total combiné
        const totalCount = movies.length + series.length + animes.length;

        // Fusion de tous les médias pour choisir une cover aléatoire parmi tout le catalogue
        const allMedia = [...movies, ...series, ...animes];

        let randomCover = 'Assets/Movies/default-cover.png';
        if (allMedia.length > 0) {
          const randomIndex = Math.floor(Math.random() * allMedia.length);
          randomCover = allMedia[randomIndex].cover;
        }

        return {
          id: genreName.toLowerCase(),
          label: genreName,
          count: totalCount, // Affiche maintenant le cumul
          cover: randomCover,
        };
      })
    );
  }
}
