import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class MoviesList {
  constructor(private http: HttpClient,
              private router: Router) {
  }

  public ApiUrl: string = environment.apiUrl;

  getMovies(): Observable<any> {
    return this.http.get<any>(`${this.ApiUrl}/movies`);
  }

  goMovie(movieSlug: any) {
    this.router.navigate(['/movies/watch' + movieSlug]);
  }

  getMoviesProgresses(userId: any) {
    return this.http.get<any>(`${this.ApiUrl}/users/show-progress/${userId}`, { withCredentials: true });
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.ApiUrl}/movies/search?q=${query}`);
  }
}
