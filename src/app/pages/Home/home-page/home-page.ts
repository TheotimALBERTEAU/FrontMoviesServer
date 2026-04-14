import {Component, ChangeDetectorRef, ViewChild, ElementRef, HostListener, OnInit, OnDestroy} from '@angular/core';
import {MoviesList} from '../../../services/Movies/movies-list';
import {Auth} from '../../../services/Users/auth'
import { CommonModule } from '@angular/common';
import {GenreService} from '../../../services/Genre/genre-service';
import {forkJoin, interval, Subscription} from 'rxjs';
import {Search} from '../../../services/Search/search';
import {MoviesProgresses} from '../../../services/Home/movies-progresses';
import {Router} from '@angular/router';

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
              private homeService: MoviesProgresses,
              public authService: Auth,
              private cdr: ChangeDetectorRef,
              private router: Router,) {}

  public progressedMovies: any[] = [];
  public genresButtons: any[] = [];
  public heroMovies: any[] = [];
  public currentIndex: number = 0;
  public progress: number = 0;
  private autoPlaySub?: Subscription;
  public isPaused: boolean = false;

  canScrollLeft = false;
  canScrollRight = false;
  public latestMovies: any[] = [];
  public canScrollLeftLatest = false;
  public canScrollRightLatest = false;
  private currentLatestIndex = 0;

  @ViewChild('slider') slider!: ElementRef;
  @ViewChild('latestSlider') latestSlider!: ElementRef;


  ngOnInit() {
    const categories = ['Action', 'Animation', 'Comédie', 'Crime', 'Horreur'];

    this.authService.checkAuth().subscribe(() => {
      const userId = this.authService.getUserId();
      if (userId) {
        this.loadMovies(userId);
      }
      this.cdr.detectChanges()
    });
    this.moviesService.getMovies().subscribe(res => {
      if (res && res.data) {
        const shuffled = [...res.data].sort(() => 0.5 - Math.random());
        this.heroMovies = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);

        this.latestMovies = res.data.slice(0, 10);

        this.startTimer();
        setTimeout(() => this.checkLatestButtons(), 200);
      }
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
    this.homeService.getMoviesProgresses(userId).subscribe((res: any) => {
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

  onClickResume(item: any) {
    const media = item.mediaId;
    if (!media) return;

    if (item.mediaType === 'Series') {
      this.router.navigate(['/series', media.slug, media.seasonNumber + "-" + media.episodeNumber]);
    } else {
      this.router.navigate(['/movies', media.slug]);
    }
  }

  scroll(direction: number) {
    if (!this.slider || !this.slider.nativeElement) return;

    const el = this.slider.nativeElement;
    const firstCard = el.querySelector('.progressed-movie-card');

    if (firstCard) {
      const cardWidth = firstCard.getBoundingClientRect().width;
      const gap = 12;
      const scrollUnit = cardWidth + gap;

      el.scrollBy({
        left: scrollUnit * direction,
        behavior: 'smooth'
      });

      setTimeout(() => this.checkButtons(), 500);
    }
  }

  checkButtons() {
    if (!this.slider || !this.slider.nativeElement) return;

    const el = this.slider.nativeElement;

    this.canScrollLeft = el.scrollLeft > 5;

    const atTheEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    this.canScrollRight = !atTheEnd;

    this.cdr.detectChanges();
  }

  scrollLatest(direction: number) {
    if (!this.latestSlider) return;
    const el = this.latestSlider.nativeElement;
    const card = el.querySelector('.movie-card-horiz');
    if (!card) return;

    const scrollUnit = card.getBoundingClientRect().width + 12;
    this.currentLatestIndex += direction;

    const maxIndex = Math.max(0, this.latestMovies.length - 8);
    if (this.currentLatestIndex > maxIndex) this.currentLatestIndex = maxIndex;
    if (this.currentLatestIndex < 0) this.currentLatestIndex = 0;

    el.scrollTo({ left: this.currentLatestIndex * scrollUnit, behavior: 'smooth' });
    setTimeout(() => this.checkLatestButtons(), 500);
  }

  checkLatestButtons() {
    if (!this.latestSlider) return;
    const el = this.latestSlider.nativeElement;
    this.canScrollLeftLatest = el.scrollLeft > 5;
    this.canScrollRightLatest = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
    this.cdr.detectChanges();
  }

  onClickGoMoviePage() {
    this.router.navigate(['/movies']);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkButtons();
    this.checkLatestButtons()
  }
}
