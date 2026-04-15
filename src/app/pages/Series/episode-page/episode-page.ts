import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {WatchSerie} from '../../../services/Series/watch-serie';
import {ActivatedRoute, Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MoviesList} from '../../../services/Movies/movies-list';
import {Auth} from '../../../services/Users/auth';

@Component({
  selector: 'app-episode-page',
  imports: [
    NgIf
  ],
  templateUrl: './episode-page.html',
  styleUrl: './episode-page.css',
})
export class EpisodePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(private watchSerie: WatchSerie,
              private moviesService: MoviesList,
              private activatedRoute: ActivatedRoute,
              private authService: Auth,
              private cdr: ChangeDetectorRef,
              public router: Router,
              private sanitizer: DomSanitizer) {
  }

  public episode: any = {};
  public movieProgress = 0;
  private progressInterval: any;
  public isTrailerOpen = false;
  public safeTrailerUrl: SafeResourceUrl | undefined;
  public seasonNum: string = "";
  public episodeNum: string = "";
  public userProgress: any[] = [];
  public seasonEpisodes: any[] = [];
  public isSeasonDropdownOpen = false;
  public totalSeasons = 0;
  public activeSeasonNum: string = "";

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const slug = params.get('slug');
      const seasonEpisode = params.get('season-:episode') || '1-1';
      const parts = seasonEpisode.split('-');
      this.seasonNum = parts[0];
      this.activeSeasonNum = parts[0];
      this.episodeNum = parts[1];

      if (slug) {
        this.loadData(slug);
      }
    });
  }

  private loadData(slug: string) {
    this.watchSerie.getEpisode(slug, parseInt(this.seasonNum), parseInt(this.episodeNum)).subscribe({
      next: (data: any) => {
        this.episode = data.data;
        this.totalSeasons = this.episode.totalSeasons;

        this.watchSerie.getSeason(slug, parseInt(this.seasonNum)).subscribe((res: any) => {
          this.seasonEpisodes = res.data.episodes;
          this.cdr.detectChanges();
        });

        this.authService.getUserProgress().subscribe({
          next: () => {
            this.userProgress = this.authService.currentUser?.progress || [];
            this.loadEpisodeProgress();
          }
        });
        this.cdr.detectChanges();
      }
    });
  }

  changeEpisode(delta: number) {
    const nextEp = parseInt(this.episodeNum) + delta;
    this.router.navigate([`/series/${this.episode.slug}/${this.seasonNum}-${nextEp}`]);
    this.cdr.detectChanges();
  }

  changeSeason(num: number) {
    this.isSeasonDropdownOpen = false;
    this.seasonNum = num.toString();
    const slug = this.episode.slug;

    if (slug) {
      this.watchSerie.getSeason(slug, num).subscribe((res: any) => {
        this.seasonEpisodes = res.data.episodes;
        this.cdr.detectChanges();
      });
    }
  }

  ngAfterViewInit() {
    if (this.movieProgress > 0) {
      this.applyProgressToVideo();
    }
  }

  private loadEpisodeProgress() {
    const user = this.authService.currentUser;
    if (user && user.progress && this.episode) {
      console.log("id:", this.episode._id, "seasonNumber:", this.seasonNum, "episodeNumber:", this.episodeNum);
      const record = user.progress.find((p: any) => {
        const progressMediaId = p.mediaId._id ? p.mediaId._id.toString() : p.mediaId.toString();

        return progressMediaId === this.episode._id &&
          Number(p.seasonNumber) === Number(this.seasonNum) &&
          Number(p.episodeNumber) === Number(this.episodeNum);
      });
      console.log(record);

      if (record) {
        this.movieProgress = record.currentTime;
        this.cdr.detectChanges();
        this.applyProgressToVideo();
      }
    }
  }

  private applyProgressToVideo() {
    if (this.videoPlayer && this.movieProgress > 0) {
      const video = this.videoPlayer.nativeElement;
      video.currentTime = this.movieProgress;
      video.play().catch(() => console.info("Lecture auto en attente d'interaction"));
    }
  }

  onMetadataLoaded() {
    this.applyProgressToVideo();
  }

  startProgressTimer() {
    this.stopProgressTimer();
    this.progressInterval = setInterval(() => {
      this.saveProgress();
    }, 30000); // Sauvegarde toutes les 30 secondes
  }

  stopProgressTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  @HostListener('window:beforeunload')
  @HostListener('window:popstate')

  ngOnDestroy() {
    this.stopProgressTimer();
    this.saveProgress();
  }

  saveProgress() {
    if (!this.videoPlayer || !this.episode || !this.authService.currentUser) return;

    const video = this.videoPlayer.nativeElement;
    const currentTime = Math.floor(video.currentTime);

    this.authService.updateProgress(
      this.episode._id,
      "Series",
      parseInt(this.seasonNum),
      parseInt(this.episodeNum),
      currentTime
    );
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

  protected readonly parseInt = parseInt;
}
