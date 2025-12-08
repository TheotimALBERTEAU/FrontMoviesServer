import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'any',
})

export class MoviesList {
  constructor(private http: HttpClient,
              private router: Router) {
  }

  getMovies(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/movies');
  }

  goMovie(movieSlug: any) {
    this.router.navigate(['/movies/' + movieSlug]);
  }
}
