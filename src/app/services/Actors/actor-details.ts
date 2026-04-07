import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActorDetails {
  constructor(private http: HttpClient) {
  }

  public ApiUrl: string = environment.apiUrl;

  getActorDetails(actorSlug: string) {
    return this.http.get(`${this.ApiUrl}/actors/${actorSlug}`);
  }

  getMoviesByActor(actorSlug: string): Observable<any> {
    return this.http.get(`${this.ApiUrl}/actors/${actorSlug}/movies`);
  }
}
