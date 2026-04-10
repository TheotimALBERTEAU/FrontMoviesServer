import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WatchSerie {

  constructor(private http: HttpClient) {}

  public ApiUrl: string = environment.apiUrl;

  getDetails(slug: string) {
    return this.http.get<any>(`${this.ApiUrl}/series/view/${slug}`);
  }

  getSeason(slug: string, seasonNumber: number) {
    return this.http.get<any>(`${this.ApiUrl}/series/view/${slug}/${seasonNumber}`);
  }
}
