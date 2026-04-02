import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MoviesList} from '../../../services/Movies/movies-list';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-movie-list-page',
  imports: [CommonModule],
  templateUrl: './movie-list-page.html',
  styleUrl: './movie-list-page.css',
})
export class MovieListPage implements OnInit {
  public movies : any[] = []
  public displayedMovies: any[] = [];

  public currentPage = 1;
  public pageSize = 32;

  constructor(private moviesService: MoviesList,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.moviesService.getMovies().subscribe({
      next: data => {
        if (data.code === "200") {
          this.movies = data.data;
          this.updateDisplay();
        }
      }
    });
  }

  updateDisplay() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedMovies = this.movies.slice(start, end);
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage() {
    if (this.hasNext()) {
      this.currentPage++;
      this.updateDisplay();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplay();
    }
  }

  hasNext(): boolean {
    return (this.currentPage * this.pageSize) < this.movies.length;
  }

  onClickGoMovie(slug: any) {
    this.moviesService.goMovie(slug);
  }
}
