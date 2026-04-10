import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MoviesList } from '../../../services/Movies/movies-list';
import { CommonModule } from '@angular/common';
import {WatchSerie} from '../../../services/Series/watch-serie';
import {last} from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-serie-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './serie-page.html',
  styleUrl: './serie-page.css'
})
export class SeriePage implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private watchSerie: WatchSerie,
    private moviesService: MoviesList,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  public details: any = {};
  public isTrailerOpen = false;
  public safeTrailerUrl: SafeResourceUrl | undefined;

  public activeSeason: number = 1;
  public currentSeason: any = {};
  public isSeasonDropdownOpen: boolean = false;

  ngOnInit() {
    const slug = this.activatedRoute.snapshot.paramMap.get('slug');
    if (slug) {
      this.watchSerie.getDetails(slug).subscribe({
        next: (data) => {
          if (data.code === "200" && data.data) {
            this.details = data.data;
            this.cdr.detectChanges();
          }
        }
      });
      this.watchSerie.getSeason(slug, this.activeSeason).subscribe({
        next: (data) => {
          if (data.code === "200" && data.data) {
            this.currentSeason = data.data;
            this.cdr.detectChanges();
          }
        }
      })
    }
  }

  loadSeason(seasonNumber: number) {
    this.activeSeason = seasonNumber;
    this.isSeasonDropdownOpen = false;

    this.watchSerie.getSeason(this.details.slug, seasonNumber).subscribe((res: any) => {
      if (res.code === "200") {
        this.currentSeason = res.data;
      }
      this.cdr.detectChanges();
    });
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

  protected readonly last = last;

  openTrailer() {
    this.isTrailerOpen = true;
    let url = this.details.trailer;
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

  onClickGoEpisode(episodeNumber: number) {
    this.router.navigate(['/series', this.details.slug, this.activeSeason + "-" + episodeNumber]);
  }
}
