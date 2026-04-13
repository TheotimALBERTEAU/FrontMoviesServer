import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GenreService } from '../../../services/Genre/genre-service';
import { CommonModule } from '@angular/common';
import { MoviesList} from '../../../services/Movies/movies-list';

@Component({
  selector: 'app-genre-page',
  imports: [CommonModule],
  templateUrl: './genre-page.html',
  styleUrl: './genre-page.css',
})
export class GenrePage implements OnInit {
  moviesByGenre: any[] = [];
  seriesByGenre: any[] = [];
  allContent: any[] = [];
  displayedContent: any[] = [];
  genreTitle: string = '';

  currentPage: number = 1;
  pageSize: number = 32;

  constructor(private route: ActivatedRoute,
              private genreService: GenreService,
              private moviesService: MoviesList,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.genreTitle = params['type'];
      this.currentPage = 1;
      this.loadAllContent()
    });
  }

  loadAllContent() {
    this.genreService.getMoviesByGenre(this.genreTitle).subscribe(resMovies => {
      this.moviesByGenre = resMovies.data;

      this.genreService.getSeriesByGenre(this.genreTitle).subscribe(resSeries => {
        this.seriesByGenre = resSeries.data;

        this.allContent = [...this.moviesByGenre, ...this.seriesByGenre];

        this.updateDisplay();
        this.cdr.detectChanges();
      })
    })
  }

  updateDisplay() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedContent = this.allContent.slice(start, end);
  }

  nextPage() {
    this.currentPage++;
    this.updateDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevPage() {
    this.currentPage--;
    this.updateDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hasNext() {
    return this.currentPage * this.pageSize < this.allContent.length;
  }

  onClickGoContent(item: any) {
    if (item.type === 'Série') {
      this.moviesService.goSerie(item.slug)
    }
    else
    {
      this.moviesService.goMovie(item.slug);
    }
  }
}
