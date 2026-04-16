import {ChangeDetectorRef, Component, ElementRef, HostListener, OnInit} from '@angular/core';
import { MoviesList } from '../../../services/Movies/movies-list';
import { CommonModule } from '@angular/common';
import { GenreService } from '../../../services/Genre/genre-service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {Favorites} from '../../../services/Favorites/favorites';
import {Auth} from '../../../services/Users/auth';

@Component({
  selector: 'app-movie-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-list-page.html',
  styleUrl: './movie-list-page.css',
})
export class MovieListPage implements OnInit {
  public allMovies: any[] = [];
  public filteredMovies: any[] = [];
  public displayedMovies: any[] = [];
  public genresButtons: any[] = [];

  public currentPage = 1;
  public pageSize = 32;

  public openFilter: string | null = null;
  public activeFilters = { type: '', genre: [] as string[], release: '', vote_average: '', sort: 'random' };

  public dynamicOptions = {
    types: [] as string[],
    genres: [] as string[],
    years: [] as string[]
  };

  public sortLabels: any = {
    'random': 'Aléatoire',
    'created_at': 'Plus récent',
    'release_year': 'Date de sortie',
    'top_rated': 'Mieux notés',
    'az': 'Nom A-Z',
    'za': 'Nom Z-A'
  };

  public userId: string | null = null;

  constructor(
    private moviesService: MoviesList,
    private cdr: ChangeDetectorRef,
    private genreService: GenreService,
    private route: ActivatedRoute,
    private router: Router,
    private eRef: ElementRef,
    public favService: Favorites,
    public authService: Auth,
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.querySelector('.filters-toolbar').contains(event.target)) {
      this.openFilter = null;
    }
  }

  ngOnInit() {
    const categories = ['Action', 'Animation', 'Comédie', 'Crime', 'Horreur'];

    this.authService.checkAuth().subscribe(() => {
      this.userId = this.authService.getUserId();
      if (this.userId) {
        this.favService.loadFavorites(this.userId);
      }
      this.cdr.detectChanges();
    });

    this.moviesService.getMovies().subscribe({
      next: data => {
        if (data.code === "200") {
          this.allMovies = data.data;
          this.generateDynamicOptions();

          this.route.queryParams.subscribe(params => {

            this.activeFilters.type = params['type'] || 'Film';
            const genreParam = params['genre'];
            this.activeFilters.genre = genreParam ? genreParam.split(',') : [];
            this.activeFilters.release = params['release'] || '';
            this.activeFilters.vote_average = params['vote_average'] || '';
            this.activeFilters.sort = params['sort'] || 'created_at';

            this.applyFilters();
          });
        }
      }
    });

    if (this.userId) {
      this.favService.loadFavorites(this.userId);
    }

    const requests = categories.map(name => this.genreService.getGenreMetadata(name));
    forkJoin(requests).subscribe(results => {
      this.genresButtons = results;
      this.cdr.detectChanges();
    });
  }

  generateDynamicOptions() {
    const types = new Set<string>();
    const genres = new Set<string>();
    const years = new Set<number>();

    this.allMovies.forEach(m => {
      if (m.type) types.add(m.type);
      if (m.genre) m.genre.forEach((g: string) => genres.add(g));
      if (m.year) years.add(Number(m.year));
    });

    this.dynamicOptions.types = Array.from(types).sort();
    this.dynamicOptions.genres = Array.from(genres).sort();

    const uniqueYears = Array.from(years).sort((a, b) => b - a);
    const yearLabels = uniqueYears.map(y => y >= 2000 ? y.toString() : 'Ancien');
    this.dynamicOptions.years = Array.from(new Set(yearLabels));
  }

  toggleFav(event: Event, movie: any) {
    event.stopPropagation();
    if (!this.userId) return;

    const typeMap: { [key: string]: 'Movies' | 'Series' | 'Animes' } = {
      'Film': 'Movies',
      'Série': 'Series',
      'Animé': 'Animes'
    };
    const apiType = typeMap[movie.type] || 'Movies';

    this.favService.toggleFavorite(this.userId, movie._id, apiType).subscribe(res => {
      if (res.isFavorite) {
        this.favService.favoriteIds.add(movie._id);
      } else {
        this.favService.favoriteIds.delete(movie._id);
      }
      this.cdr.detectChanges();
    });
  }

  toggleFilterValue(key: 'type' | 'release' | 'vote_average', value: string) {
    (this.activeFilters as any)[key] = (this.activeFilters as any)[key] === value ? '' : value;
  }

  toggleGenre(g: string) {
    const i = this.activeFilters.genre.indexOf(g);
    if (i > -1) this.activeFilters.genre.splice(i, 1);
    else this.activeFilters.genre.push(g);
  }

  clearCategory(key: string) {
    if (key === 'genre') this.activeFilters.genre = [];
    else (this.activeFilters as any)[key] = '';
    this.submitFilters();
  }

  submitFilters() {
    const queryParams: any = {
      type: this.activeFilters.type || null,
      genre: this.activeFilters.genre.length ? this.activeFilters.genre.join(',') : null,
      release: this.activeFilters.release || null,
      vote_average: this.activeFilters.vote_average || null,
      sort: this.activeFilters.sort
    };
    this.router.navigate(['/movies'], { queryParams });
    this.openFilter = null;
  }

  applyFilters() {
    let result = [...this.allMovies];
    if (this.activeFilters.type) result = result.filter(m => m.type === this.activeFilters.type);
    if (this.activeFilters.genre.length) {
      result = result.filter(m => this.activeFilters.genre.some(g => m.genre.includes(g)));
    }

    if (this.activeFilters.release) {
      if (this.activeFilters.release === 'Ancien') {
        result = result.filter(m => Number(m.year) < 2000);
      } else {
        result = result.filter(m => m.year.toString() === this.activeFilters.release);
      }
    }

    if (this.activeFilters.vote_average) {
      const filterVal = parseInt(this.activeFilters.vote_average);
      result = result.filter(m => {
        const rating = parseFloat(m.rating);
        return filterVal === 10 ? rating >= 10 : Math.floor(rating) === filterVal;
      });
    }

    if (this.activeFilters.sort === 'random') {
      result = result.sort(() => Math.random() - 0.5);
    }
    else if (this.activeFilters.sort === 'created_at') {
      result =  result.sort((a, b) => {return b._id.toString().localeCompare(a._id.toString());});
    }
    else if (this.activeFilters.sort === 'release_year') {
      result = result.sort((a, b) => Number(b.year) - Number(a.year));
    }
    else if (this.activeFilters.sort === 'top_rated') {
      result = result.sort((a, b) => b.imdb_rating - a.imdb_rating);
    }
    else if (this.activeFilters.sort === 'az') {
      result = result.sort((a, b) => a.title.localeCompare(b.title));
    }
    else if (this.activeFilters.sort === 'za') {
      result = result.sort((a, b) => b.title.localeCompare(a.title));
    }

    this.filteredMovies = result;
    this.currentPage = 1;
    this.updateDisplay();
  }

  updateDisplay() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedMovies = this.filteredMovies.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
    if (this.currentPage > 1) window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  nextPage() { if (this.hasNext()) { this.currentPage++; this.updateDisplay(); } }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.updateDisplay(); } }
  hasNext(): boolean { return (this.currentPage * this.pageSize) < this.filteredMovies.length; }
  onClickGoMovie(slug: any) { this.moviesService.goMovie(slug); }
  onClickGoGenre(genre: any) {
    this.router.navigate(['/movies'], { queryParams: { genre: genre } });
  }
}
