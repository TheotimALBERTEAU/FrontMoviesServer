import {ChangeDetectorRef, Component} from '@angular/core';
import {MoviesList} from '../../../services/Movies/movies-list';

@Component({
  selector: 'app-movie-list-page',
  imports: [],
  templateUrl: './movie-list-page.html',
  styleUrl: './movie-list-page.css',
})
export class MovieListPage {
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
    });
  }

  onClickGoMovie(slug: any) {
    this.moviesService.goMovie(slug);
  }
}
