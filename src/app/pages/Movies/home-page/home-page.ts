import {Component, ChangeDetectorRef, ViewChild, ElementRef, HostListener, OnInit, OnDestroy} from '@angular/core';
import {MoviesList} from '../../../services/Movies/movies-list';
import {Auth} from '../../../services/Users/auth'
import { CommonModule } from '@angular/common';
import {GenreService} from '../../../services/Movies/genre-service';
import {forkJoin, interval, Subscription} from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit, OnDestroy {
  constructor(private moviesService: MoviesList,
              private genreService: GenreService,
              public authService: Auth,
              private cdr: ChangeDetectorRef) {}

  public progressedMovies: any[] = [];
  public genresButtons: any[] = [];
  public heroMovies: any[] = [];
  public currentIndex: number = 0;
  public progress: number = 0;
  private autoPlaySub?: Subscription;
  public isPaused: boolean = false;


  ngOnInit() {
    const categories = ['Action', 'Animation', 'Comedy', 'Crime', 'Horror'];

    this.authService.checkAuth().subscribe(() => {
      const userId = this.authService.getUserId();
      if (userId) {
        this.loadMovies(userId);
      }
      this.cdr.detectChanges()
    });
    this.moviesService.getMovies().subscribe(res => {
      this.heroMovies = res.data.slice(0, 2);
      this.startTimer();
    });
    const requests = categories.map(name => this.genreService.getGenreMetadata(name));
    forkJoin(requests).subscribe(results => {
      this.genresButtons = results;
      this.cdr.detectChanges();
    });
  }

  togglePause(event: Event) {
    event.stopPropagation();
    this.isPaused = !this.isPaused;
  }

  startTimer() {
    this.progress = 0;
    if (this.autoPlaySub) this.autoPlaySub.unsubscribe();
    this.autoPlaySub = interval(50).subscribe(() => {
      if (!this.isPaused) {
        this.progress += 3;
        this.cdr.detectChanges();
        if (this.progress >= 100) {
          this.nextSlide();
        }
      }
    });
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.heroMovies.length;
    this.startTimer();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.heroMovies.length) % this.heroMovies.length;
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.autoPlaySub) this.autoPlaySub.unsubscribe();
  }

  loadMovies(userId: string) {
    this.moviesService.getMoviesProgresses(userId).subscribe((res: any) => {
      if (res && res.code === "200") {
        this.progressedMovies = res.data;
      }
      setTimeout(() => {
        this.checkButtons();
      }, 50);
      this.cdr.detectChanges();
    });
  }

  onClickGoMovie(slug: any) {
    this.moviesService.goMovie(slug);
  }

  onClickGoGenre(genre: any) {
    this.moviesService.goGenre(genre.toLowerCase())
  }

  @ViewChild('slider') slider!: ElementRef;

  canScrollLeft = false;
  canScrollRight = false;

  checkButtons() {
    if (!this.slider || !this.slider.nativeElement) return;

    const el = this.slider.nativeElement;
    this.canScrollLeft = el.scrollLeft > 2;
    const atTheEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
    this.canScrollRight = !atTheEnd;

    this.cdr.detectChanges();
  }

  scroll(direction: number) {
    const el = this.slider.nativeElement;
    const firstCard = el.querySelector('.progressed-movie-card');

    if (firstCard) {
      const cardWidth = firstCard.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(el).gap) || 16;
      const scrollAmount = cardWidth + gap;

      el.scrollLeft += (scrollAmount * direction);
      if (direction > 0) this.canScrollLeft = true;
      setTimeout(() => {
        this.checkButtons();
      }, 400);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkButtons();
  }
}
