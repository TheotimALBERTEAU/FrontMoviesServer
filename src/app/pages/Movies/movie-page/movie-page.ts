import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {WatchMovie} from '../../../services/Movies/watch-movie';
import {ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-movie-page',
  imports: [],
  templateUrl: './movie-page.html',
  styleUrl: './movie-page.css',
})
export class MoviePage {

    constructor(private http: HttpClient,
                private activatedRoute: ActivatedRoute,
                private watchMovie : WatchMovie,
                private cdr: ChangeDetectorRef) {}

    public details : any = []

    ngOnInit() {
      const movieSlug = this.activatedRoute.snapshot.paramMap.get('slug');
      if (movieSlug) {
        this.watchMovie.getDetails(movieSlug).subscribe({
          next: data => {
            if (data.code === "200" && data.data) {
              this.details = data.data
              this.cdr.detectChanges();
            }
          }
        })
      }
    }
}
