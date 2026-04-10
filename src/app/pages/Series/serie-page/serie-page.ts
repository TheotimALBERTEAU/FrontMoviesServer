import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WatchMovie } from '../../../services/Movies/watch-movie';
import { MoviesList } from '../../../services/Movies/movies-list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-serie-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './serie-page.html',
  styleUrl: './serie-page.css'
})
export class SeriePage implements OnInit {
  public details: any = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private watchMovie: WatchMovie,
    private moviesService: MoviesList,
    private router: Router
  ) {}

  ngOnInit() {
    const slug = this.activatedRoute.snapshot.paramMap.get('slug');
    if (slug) {
      this.watchMovie.getDetails(slug).subscribe({
        next: (data) => {
          if (data.code === "200" && data.data) {
            this.details = data.data;
          }
        }
      });
    }
  }

  playFirstEpisode() {
    console.log("Lecture de l'épisode 1");
  }

  onClickGoGenre(genre: string) {
    this.moviesService.goGenre(genre.toLowerCase());
  }

  onClickGoActor(actorSlug: string) {
    this.router.navigate(['/actor/', actorSlug]);
  }
}
