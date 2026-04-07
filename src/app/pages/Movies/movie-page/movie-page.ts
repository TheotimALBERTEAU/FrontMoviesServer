import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {WatchMovie} from '../../../services/Movies/watch-movie';
import {ChangeDetectorRef} from '@angular/core';
import {Auth} from '../../../services/Users/auth';
import {last} from 'rxjs';
import {MoviesList} from '../../../services/Movies/movies-list';

@Component({
  selector: 'app-movie-page',
  imports: [],
  templateUrl: './movie-page.html',
  styleUrl: './movie-page.css',
})
export class MoviePage {

  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private watchMovie: WatchMovie,
              private authService: Auth,
              private cdr: ChangeDetectorRef,
              private moviesService: MoviesList,
              private router: Router,) {
  }

  public details: any = [];
  public movieProgress = 0;
  private progressInterval: any;

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

  private loadMovieProgress() {
    const user = this.authService.currentUser;

    if (user && user.progress && this.details) {
      const record = user.progress.find((p: any) => p.movieId._id === this.details._id);

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
  }

  @HostListener('window:beforeunload')
  @HostListener('window:popstate')
  onPageExit() {
    this.saveProgress();
  }

  ngOnDestroy() {
    this.stopProgressTimer();
    this.saveProgress();
  }

  saveProgress() {
    if (!this.videoPlayer || !this.details || !this.authService.currentUser) return;

    const video = this.videoPlayer.nativeElement;
    const currentTime = Math.floor(video.currentTime);
    const duration = Math.floor(video.duration);

    const finalTime = (currentTime / duration > 0.95) ? 0 : currentTime;

    this.authService.updateProgress(this.details._id, finalTime)
  }

  protected readonly last = last;

  onClickGoGenre(genre: any) {
    this.moviesService.goGenre(genre.toLowerCase())
  }

  onClickGoActor(actorSlug: any) {
    this.router.navigate(['/actor/', actorSlug]);
  }
}
