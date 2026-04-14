import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {WatchMovie} from '../../../services/Movies/watch-movie';
import {ChangeDetectorRef} from '@angular/core';
import {Auth} from '../../../services/Users/auth';
import {last} from 'rxjs';
import {MoviesList} from '../../../services/Movies/movies-list';
import {CommonModule} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-movie-page',
  imports: [
    CommonModule,
  ],
  templateUrl: './movie-page.html',
  styleUrl: './movie-page.css',
})
export class MoviePage implements OnInit, AfterViewInit {

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private watchMovie: WatchMovie,
              private authService: Auth,
              private cdr: ChangeDetectorRef,
              private moviesService: MoviesList,
              private router: Router,
              private sanitizer: DomSanitizer) {
  }

  public details: any = [];
  public movieProgress = 0;
  private progressInterval: any;
  public isTrailerOpen = false;
  public safeTrailerUrl: SafeResourceUrl | undefined;

  ngOnInit() {
    const movieSlug = this.activatedRoute.snapshot.paramMap.get('slug');
    if (movieSlug) {
      this.watchMovie.getDetails(movieSlug).subscribe({
        next: data => {
          if (data.code === "200" && data.data) {
            this.details = data.data
            this.authService.getUserProgress().subscribe({
              next: () => {
                this.loadMovieProgress();
                this.cdr.detectChanges();
              }
            });
          }
        }
      });
    }
  }

  ngAfterViewInit() {
    if (this.movieProgress > 0 && this.videoPlayer) {
      this.applyProgressToVideo();
    }
  }

  private loadMovieProgress() {
    const user = this.authService.currentUser;

    if (user && user.progress && this.details) {
      const record = user.progress.find((p: any) => p.mediaId._id === this.details._id);

      if (record) {
        this.movieProgress = record.currentTime;
        if (this.videoPlayer) {
          this.applyProgressToVideo();
        }
      }
    }
  }

  private applyProgressToVideo() {
    const video = this.videoPlayer.nativeElement;
    if (this.movieProgress > 0) {
      video.currentTime = this.movieProgress;
      video.play().catch(() => console.error("Play bloqué"));
    }
  }

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  onMetadataLoaded() {
    this.applyProgressToVideo();
  }

  startProgressTimer() {
    this.stopProgressTimer();
    this.progressInterval = setInterval(() => {
      this.saveProgress();
    }, 30000);
  }

  stopProgressTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.saveProgress();
  }

  @HostListener('window:beforeunload')
  @HostListener('window:popstate')


  ngOnDestroy() {
    this.stopProgressTimer();
    this.saveProgress();
  }

  saveProgress() {
    if (!this.videoPlayer || !this.details || !this.authService.currentUser) return;

    const video = this.videoPlayer.nativeElement;
    const currentTime = Math.floor(video.currentTime);
    console.log(currentTime);

    const mediaId = this.details._id;
    const mediaType = "Movies";
    const seasonNumber = null;
    const episodeNumber = null;

    this.authService.updateProgress(mediaId, mediaType, seasonNumber, episodeNumber, currentTime);
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

  onClickGoGenre(genre: any) {
    this.moviesService.goGenre(genre.toLowerCase())
  }

  onClickGoActor(actorSlug: any) {
    this.router.navigate(['/actor/', actorSlug]);
  }
}
