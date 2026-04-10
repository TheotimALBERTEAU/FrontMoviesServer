import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeriesList {
  public ApiUrl: string = environment.apiUrl; // Ajuste l'URL selon ton API

  constructor(private http: HttpClient, private router: Router) {}

  // Récupère toutes les séries
  getSeries(): Observable<any> {
    return this.http.get<any>(`${this.ApiUrl}/series`);
  }

  goSerie(slug: string) {
    this.router.navigate(['/series/view/', slug]);
  }
}
