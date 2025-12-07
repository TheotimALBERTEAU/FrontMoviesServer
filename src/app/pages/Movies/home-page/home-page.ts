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

  ngOnInit() {
    this.moviesService.getMovies().subscribe({
      next: data => {
        if (data.code === "200") {
          this.movies = data.data;
          this.cdr.detectChanges();
        }
      }
    })
  }

  onClickGoMovie(title: any) {
    this.moviesService.goMovie(title);
  }
}
