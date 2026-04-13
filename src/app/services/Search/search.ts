import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Search {
  constructor(private http: HttpClient) {
  }

  public ApiUrl: string = environment.apiUrl;

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.ApiUrl}/movies/search?q=${query}`);
  }

  searchActors(query: string): Observable<any> {
    return this.http.get(`${this.ApiUrl}/actors/search?q=${query}`);
  }
}
