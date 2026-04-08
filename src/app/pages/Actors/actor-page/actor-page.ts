import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActorDetails} from '../../../services/Actors/actor-details';
import {ActivatedRoute} from '@angular/router';
import {MoviesList} from '../../../services/Movies/movies-list';
import {DatePipe} from '@angular/common';

interface GroupedFilmography {
  year: string;
  movies: any[];
}

@Component({
  selector: 'app-actor-page',
  imports: [
    DatePipe
  ],
  templateUrl: './actor-page.html',
  styleUrl: './actor-page.css',
})
export class ActorPage implements OnInit {
  public actor: any = [];
  public actorMovies: any[] = [];
  public groupedFilmography: GroupedFilmography[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private actorService: ActorDetails,
    private moviesService: MoviesList,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const actorSlug = this.activatedRoute.snapshot.paramMap.get('slug');
    if (actorSlug) {
      this.actorService.getActorDetails(actorSlug).subscribe({
        next: (data: any) => {
          if (data.code === "200" && data.data) {
            this.actor = data.data;
            console.log(this.actor.profile_picture);
          }
          this.cdr.detectChanges();
        }
      });
      this.loadActorData(actorSlug);
    }
  }

  loadActorData(slug: string) {
    this.actorService.getMoviesByActor(slug).subscribe(res => {
      this.actorMovies = res.data;
      this.processFilmography(res.data);
      this.cdr.detectChanges();
    });
  }

  processFilmography(movies: any[]) {
    const sorted = [...movies].sort((a, b) => Number(b.year) - Number(a.year));

    const groups = sorted.reduce((acc: GroupedFilmography[], movie) => {
      const lastGroup = acc[acc.length - 1];
      if (lastGroup && lastGroup.year === movie.year.toString()) {
        lastGroup.movies.push(movie);
      } else {
        acc.push({ year: movie.year.toString(), movies: [movie] });
      }
      return acc;
    }, []);

    this.groupedFilmography = groups;
  }

  onClickGoMovie(slug: string) {
    this.moviesService.goMovie(slug);
  }
}
