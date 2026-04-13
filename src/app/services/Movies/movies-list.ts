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
    this.router.navigate(['/movies/' + movieSlug]);
  }

  goSerie(movieSlug: any) {
    this.router.navigate(['/series/' + movieSlug]);
  }

  goMedia(media: any) {
    if (media.type === "Série") {
      this.router.navigate(['/series/' + media.slug]);
    } else {
      this.router.navigate(['/movies/' + media.slug]);
    }
  }

  goGenre(genre: any) {
    this.router.navigate(['/genre/' + genre]);
  }
}
