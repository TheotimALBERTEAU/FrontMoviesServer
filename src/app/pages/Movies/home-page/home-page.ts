import { Component, ChangeDetectorRef } from '@angular/core';
import {MoviesList} from '../../../services/Movies/movies-list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  constructor(private moviesService: MoviesList,
              private cdr: ChangeDetectorRef) {}

  public movies : any[] = []
  public progressedMovies : any[] = []

  ngOnInit() {
    this.moviesService.getMovies().subscribe({
      next: data => {
        if (data.code === "200") {
          this.movies = data.data;
          this.cdr.detectChanges();
        }
      }
    });
    this.moviesService.getMoviesProgresses('69c9904855461fadd0530db7').subscribe({
      next: data => {
        if (data.code === "200") {
          this.progressedMovies = data.data;
          console.log(this.progressedMovies);
          this.cdr.detectChanges();
        }
      }
    })
  }

  onClickGoMovie(slug: any) {
    this.moviesService.goMovie(slug);
  }
}
