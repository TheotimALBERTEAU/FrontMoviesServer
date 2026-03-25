import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WatchMovie {

  constructor(private http: HttpClient) {}

  public ApiUrl: string = 'http://localhost:3000';

  getDetails(slug: string) {
    return this.http.get<any>(`${this.ApiUrl}/movies/${slug}`);
  }
}
