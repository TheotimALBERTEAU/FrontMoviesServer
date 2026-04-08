import {Component, OnInit} from '@angular/core';
import { MoviesList} from '../../../services/Movies/movies-list';
import {ActivatedRoute} from '@angular/router';
import { ChangeDetectorRef} from '@angular/core';
import {ActorsList} from '../../../services/Actors/actors-list';
import {forkJoin} from 'rxjs';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-search-page',
  imports: [CommonModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage implements OnInit {
  public query: string = '';
  public resultsMoviesList: any[] = [];
  public resultsActorsList: any[] = [];

  constructor(
    private moviesService: MoviesList,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private actorsService: ActorsList
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.query = params['query'];

      if (this.query) {
        forkJoin({
          movies: this.moviesService.searchMovies(this.query),
          actors: this.actorsService.searchActors(this.query)
        }).subscribe({
          next: (res) => {
            this.resultsMoviesList = res.movies.code === "200" ? res.movies.data : [];
            this.resultsActorsList = res.actors.code === "200" ? res.actors.data : [];
            console.log(this.resultsActorsList.length);
            console.log(this.resultsMoviesList.length);

            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("Erreur lors de la recherche globale", err);
          }
        });
      }
    });
  }

  onClickGoMovie(slug: any) {
    this.moviesService.goMovie(slug);
  }

  onClickGoActor(actorSlug: any) {
    this.actorsService.goActor(actorSlug);
  }
}
