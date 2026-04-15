import {Component, ChangeDetectorRef, ViewChild, ElementRef, HostListener, OnInit, OnDestroy} from '@angular/core';
import {MoviesList} from '../../../services/Movies/movies-list';
import {Auth} from '../../../services/Users/auth'
import { CommonModule } from '@angular/common';
import {GenreService} from '../../../services/Genre/genre-service';
import {forkJoin, interval, Subscription} from 'rxjs';
import {Search} from '../../../services/Search/search';
import {MoviesProgresses} from '../../../services/Home/movies-progresses';
import {Router} from '@angular/router';
import {SeriesList} from '../../../services/Series/series-list';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit, OnDestroy {
  constructor(private moviesService: MoviesList,
              private seriesService: SeriesList,
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

  // Slider "Reprendre la lecture"
  @ViewChild('slider') slider!: ElementRef;
  canScrollLeft = false;
  canScrollRight = false;

  // Slider Nouveaux Films
  @ViewChild('moviesSlider') moviesSlider!: ElementRef;
  public latestMovies: any[] = [];
  public canScrollLeftMovies = false;
  public canScrollRightMovies = false;

  // Slider Nouvelles Séries
  @ViewChild('seriesSlider') seriesSlider!: ElementRef;
  public latestSeries: any[] = [];
  public canScrollLeftSeries = false;
  public canScrollRightSeries = false;


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
        setTimeout(() => this.checkButtons(), 200);
      }
    });

    this.seriesService.getSeries().subscribe(res => {
      if (res && res.data) {
        this.latestSeries = res.data.slice(0, 10);
        setTimeout(() => this.checkButtons(), 200);
      }
    });

    const requests = categories.map(name => this.genreService.getGenreMetadata(name));
    forkJoin(requests).subscribe(results => {
      this.genresButtons = results;
      this.cdr.detectChanges();
    });
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

  togglePause(event: Event) {
    event.stopPropagation();
    this.isPaused = !this.isPaused;
  }

  scroll(direction: number) {
    if (!this.slider?.nativeElement) return;
    const el = this.slider.nativeElement;
    const firstCard = el.querySelector('.progressed-movie-card');
    if (firstCard) {
      const scrollUnit = (firstCard.getBoundingClientRect().width + 12) * 2;
      el.scrollBy({ left: scrollUnit * direction, behavior: 'smooth' });
      setTimeout(() => this.checkButtons(), 500);
    }
  }

  scrollHoriz(direction: number, type: 'movies' | 'series') {
    const el = type === 'movies' ? this.moviesSlider.nativeElement : this.seriesSlider.nativeElement;
    const card = el.querySelector('.media-card-horiz');
    if (!card) return;

    const scrollAmount = card.getBoundingClientRect().width + 12;

    el.scrollBy({
      left: scrollAmount * direction,
      behavior: 'smooth'
    });

    setTimeout(() => this.checkButtons(), 500);
  }

  checkButtons() {
    const check = (el: HTMLElement) => {
      const canLeft = el.scrollLeft > 5;
      const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
      return { canLeft, canRight };
    };
    if (this.slider?.nativeElement) {
      const res = check(this.slider.nativeElement);
      this.canScrollLeft = res.canLeft;
      this.canScrollRight = res.canRight;
    }
    if (this.moviesSlider?.nativeElement) {
      const res = check(this.moviesSlider.nativeElement);
      this.canScrollLeftMovies = res.canLeft;
      this.canScrollRightMovies = res.canRight;
    }
    if (this.seriesSlider?.nativeElement) {
      const res = check(this.seriesSlider.nativeElement);
      this.canScrollLeftSeries = res.canLeft;
      this.canScrollRightSeries = res.canRight;
    }
    this.cdr.detectChanges();
  }

  loadMovies(userId: string) {
    this.homeService.getMoviesProgresses(userId).subscribe((res: any) => {
      if (res && res.code === "200") {
        this.progressedMovies = res.data;
      }
      setTimeout(() => this.checkButtons(), 50);
      this.cdr.detectChanges();
    });
  }

  onClickGoMovie(slug: any) {
    this.moviesService.goMovie(slug);
  }

  onClickGoSerie(slug: any) {
    this.seriesService.goSerie(slug);
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

  onClickGoMoviePage() {
    this.router.navigate(['/movies']);
  }

  onClickGoSeriePage() {
    this.router.navigate(['/series']);
  }

  ngOnDestroy() {
    if (this.autoPlaySub) this.autoPlaySub.unsubscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkButtons();
  }
}
