import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActorDetails} from '../../../services/Actors/actor-details';
import {ActivatedRoute} from '@angular/router';
import {MoviesList} from '../../../services/Movies/movies-list';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-actor-page',
  imports: [
    DatePipe
  ],
  templateUrl: './actor-page.html',
  styleUrl: './actor-page.css',
})
export class ActorPage {
  public actor: any = [];
  public actorMovies: any[] = [];

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
        }
      });
      this.loadActorData(actorSlug);
      this.cdr.detectChanges();
    }
  }

  loadActorData(slug: string) {
    this.actorService.getMoviesByActor(slug).subscribe(res => {
      this.actor = res.data;

      this.actorService.getMoviesByActor(this.actor.slug).subscribe(movieRes => {
        this.actorMovies = movieRes.data;
      });
    });
  }

  onClickGoMovie(slug: string) {
    this.moviesService.goMovie(slug);
  }
}
