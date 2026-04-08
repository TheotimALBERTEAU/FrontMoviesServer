import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActorsList {
  constructor(private http: HttpClient,
              private router: Router) {
  }

  public ApiUrl: string = environment.apiUrl;

  getActors(): Observable<any> {
    return this.http.get<any>(`${this.ApiUrl}/actors`);
  }

  goActor(actorSlug: any) {
    this.router.navigate(['/actor/' + actorSlug]);
  }

  searchActors(query: string): Observable<any> {
    return this.http.get(`${this.ApiUrl}/actors/search?q=${query}`);
  }
}
