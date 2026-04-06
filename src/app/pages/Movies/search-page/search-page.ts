import { Component } from '@angular/core';
import { MoviesList} from '../../../services/Movies/movies-list';
import {ActivatedRoute} from '@angular/router';
import { ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-search-page',
  imports: [],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage {
  public query: string = '';
  public resultsMoviesList: any[] = [];


  constructor(private moviesService: MoviesList,
              private route: ActivatedRoute,
              private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.query = params['query'];
      this.moviesService.searchMovies(this.query).subscribe(res => {
        if (res.code === "200") {
          this.resultsMoviesList = res.data;
        }
        this.cdr.detectChanges();
      });
    })
  }

  onClickGoMovie(slug: any) {
    this.moviesService.goMovie(slug);
  }

  onClickGoGenre(genre: any) {
    this.moviesService.goGenre(genre.toLowerCase())
  }
}
