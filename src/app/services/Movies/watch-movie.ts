import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WatchMovie {

  constructor(private http: HttpClient) {}

  public ApiUrl: string = environment.apiUrl;

  getDetails(slug: string) {
    return this.http.get<any>(`${this.ApiUrl}/movies/${slug}`);
  }
}
