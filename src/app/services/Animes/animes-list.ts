import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimesList {
  public ApiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  getAnimes(): Observable<any> {
    return this.http.get<any>(`${this.ApiUrl}/animes`);
  }

  goAnime(slug: string) {
    this.router.navigate(['/animes/', slug]);
  }
}
