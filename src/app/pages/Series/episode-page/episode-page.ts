import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {WatchSerie} from '../../../services/Series/watch-serie';
import {ActivatedRoute, Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MoviesList} from '../../../services/Movies/movies-list';

@Component({
  selector: 'app-episode-page',
  imports: [
    NgIf
  ],
  templateUrl: './episode-page.html',
  styleUrl: './episode-page.css',
})
export class EpisodePage implements OnInit {
  constructor(private watchSerie: WatchSerie,
              private moviesService: MoviesList,
              private activatedRoute: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private router: Router,
              private sanitizer: DomSanitizer) {
  }

  public episode: any = {};
  public isTrailerOpen = false;
  public safeTrailerUrl: SafeResourceUrl | undefined;

  ngOnInit() {
    const slug = this.activatedRoute.snapshot.paramMap.get('slug');
    const seasonEpisode = this.activatedRoute.snapshot.paramMap.get('season-:episode') || '1-1';

    const parts = seasonEpisode.split('-');
    const seasonNum = parts[0];
    const episodeNum = parts[1];

    if (slug) {
      this.watchSerie.getEpisode(slug, parseInt(seasonNum), parseInt(episodeNum)).subscribe({
        next: (data: any) => {
          this.episode = data.data;
          this.cdr.detectChanges();
        }
      })
    }
  }

  openTrailer() {
    this.isTrailerOpen = true;
    let url = this.episode.trailer;
    if (url.includes('youtube.com/watch?v=')) {
      url = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      url = url.replace('youtu.be/', 'youtube.com/embed/');
    }

    const finalUrl = `${url}?autoplay=1&mute=1`;
    this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
    document.body.style.overflow = 'hidden';
  }

  closeTrailer() {
    this.isTrailerOpen = false;
    document.body.style.overflow = 'auto';
  }

  onClickGoGenre(genre: any) {
    this.moviesService.goGenre(genre.toLowerCase())
  }

  onClickGoActor(actorSlug: any) {
    this.router.navigate(['/actor/', actorSlug]);
  }
}
