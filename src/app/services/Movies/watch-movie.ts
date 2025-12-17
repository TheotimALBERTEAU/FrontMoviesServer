import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WatchMovie {

  constructor(private http: HttpClient) {}

  public ApiUrl: string = 'https://hessflix.ddns.net:8443/api';

  getDetails(slug: string) {
    return this.http.get<any>(`${this.ApiUrl}/movies/${slug}`);
  }
}
