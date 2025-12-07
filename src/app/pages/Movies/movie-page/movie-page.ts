import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {WatchMovie} from '../../../services/Movies/watch-movie';

@Component({
  selector: 'app-movie-page',
  imports: [],
  templateUrl: './movie-page.html',
  styleUrl: './movie-page.css',
})
export class MoviePage {

    constructor(private http: HttpClient,
                private activatedRoute: ActivatedRoute,
                private watchMovie : WatchMovie) {}

    public details : any = []

    ngOnInit() {
      const movieTitle = this.activatedRoute.snapshot.paramMap.get('title');
      this.watchMovie.getDetails().subscribe({
        next: data => {
          if (data.code === "200" && data.data && movieTitle) {
            this.details = data.data.find((movie: any) => movie.title === movieTitle);
          }
        }
      })
    }
}
