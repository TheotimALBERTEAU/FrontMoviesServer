import {Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {WatchMovie} from '../../../services/Movies/watch-movie';
import {ChangeDetectorRef} from '@angular/core';
import {Auth} from '../../../services/Users/auth';

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
              private cdr: ChangeDetectorRef) {
  }

  public details: any = [];
  public movieProgress = 0;

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
    console.log("User progress : ", this.authService.currentUser.progress);
    console.log("Progress : ", user.progress.find((p: any) => p.movieId._id === this.details._id));

    if (user && user.progress && this.details) {
      const record = user.progress.find((p: any) => p.movieId._id === this.details._id);
      console.log("Record : ", record)

      if (record) {
        this.movieProgress = record.currentTime;
        console.log("Progression appliquée :", this.movieProgress);
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
      video.play().catch(() => console.log("Play bloqué"));
    }
  }

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  onMetadataLoaded() {
    this.applyProgressToVideo();
  }
}
