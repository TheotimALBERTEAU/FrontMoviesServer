import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenreService } from '../../../services/Genre/genre-service';
import { CommonModule } from '@angular/common';
import { MoviesList } from '../../../services/Movies/movies-list';
import { forkJoin } from 'rxjs';
import {Favorites} from '../../../services/Favorites/favorites';
import {Auth} from '../../../services/Users/auth';
import {Profile} from '../../../services/Users/profile';

@Component({
  selector: 'app-genre-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './genre-page.html',
  styleUrl: './genre-page.css',
})
export class GenrePage implements OnInit {
  public allContent: any[] = []; // Fusion Movies + Series
  public filteredContent: any[] = [];
  public displayedContent: any[] = [];

  public genreTitle: string = '';
  public currentPage: number = 1;
  public pageSize: number = 32;

  // Filtres
  public openFilter: string | null = null;
  public activeFilters = { type: '', genre: [] as string[], release: '', vote_average: '', sort: 'random' };

  public dynamicOptions = {
    types: ['Film', 'Série'],
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
    private route: ActivatedRoute,
    private genreService: GenreService,
    private moviesService: MoviesList,
    private profileService: Profile,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef,
  public favService: Favorites,
  public authService: Auth,
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.querySelector('.filters-toolbar')?.contains(event.target)) {
      this.openFilter = null;
    }
  }

  ngOnInit() {
    this.authService.checkAuth().subscribe(() => {
      this.userId = this.authService.getUserId();
      if (this.userId) {
        this.favService.loadFavorites(this.userId);
      }
      this.cdr.detectChanges();
    });

    this.route.params.subscribe(params => {
      const rawGenre = params['type'];

      if (rawGenre) {
        this.genreTitle = rawGenre.charAt(0).toUpperCase() + rawGenre.slice(1);
        this.activeFilters.genre = [this.genreTitle];
      }

      this.currentPage = 1;
      this.loadData();
    });
  }

  loadData() {
    // On récupère les deux sources en même temps
    forkJoin({
      movies: this.genreService.getMoviesByGenre(this.genreTitle),
      series: this.genreService.getSeriesByGenre(this.genreTitle),
      animes: this.genreService.getAnimesByGenre(this.genreTitle)
    }).subscribe(({ movies, series, animes }) => {
      this.allContent = [...movies.data, ...series.data, ...animes.data];

      this.generateDynamicOptions();
      this.applyFilters(); // Initialise l'affichage
    });
  }

  generateDynamicOptions() {
    const years = new Set<number>();
    const genres = new Set<string>();

    this.allContent.forEach(item => {
      if (item.year) years.add(Number(item.year));
      if (item.genre) item.genre.forEach((g: string) => genres.add(g));
    });

    this.dynamicOptions.genres = Array.from(genres).sort();

    const uniqueYears = Array.from(years).sort((a, b) => b - a);
    this.dynamicOptions.years = uniqueYears.map(y => y >= 2000 ? y.toString() : 'Ancien');
    this.dynamicOptions.years = Array.from(new Set(this.dynamicOptions.years));
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
    this.applyFilters();
    this.openFilter = null;
  }

  applyFilters() {
    let result = [...this.allContent];

    // Filtre Type
    if (this.activeFilters.type) {
      result = result.filter(m => m.type === this.activeFilters.type);
    }

    // Filtre Genre (Multi-sélection)
    if (this.activeFilters.genre.length) {
      result = result.filter(m => this.activeFilters.genre.some(g => m.genre.includes(g)));
    }

    // Filtre Date
    if (this.activeFilters.release) {
      if (this.activeFilters.release === 'Ancien') {
        result = result.filter(m => Number(m.year) < 2000);
      } else {
        result = result.filter(m => m.year.toString() === this.activeFilters.release);
      }
    }

    // Filtre Note
    if (this.activeFilters.vote_average) {
      const filterVal = parseInt(this.activeFilters.vote_average);
      result = result.filter(m => {
        const rating = parseFloat(m.rating || m.imdb_rating);
        return filterVal === 10 ? rating >= 10 : Math.floor(rating) === filterVal;
      });
    }

    // Tris
    this.sortResults(result);
  }

  sortResults(result: any[]) {
    if (this.activeFilters.sort === 'random') {
      result.sort(() => Math.random() - 0.5);
    } else if (this.activeFilters.sort === 'created_at') {
      result.sort((a, b) => {return b._id.toString().localeCompare(a._id.toString());});
    } else if (this.activeFilters.sort === 'release_year') {
      result.sort((a, b) => Number(b.year) - Number(a.year));
    } else if (this.activeFilters.sort === 'top_rated') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (this.activeFilters.sort === 'az') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.activeFilters.sort === 'za') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    this.filteredContent = result;
    this.currentPage = 1;
    this.updateDisplay();
  }

  updateDisplay() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedContent = this.filteredContent.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  onClickAddToHistory(item: any) {
    console.log(item)
    const userId = this.authService.getUserId();
    if (!userId || !item._id) return;

    // Mapping pour convertir tes types français en types Backend
    const typeMapping: { [key: string]: string } = {
      'Film': 'Movies',
      'Série': 'Series',
      'Animé': 'Animes'
    };

    const mediaType = typeMapping[item.type] || item.type;

    this.profileService.addToHistory(userId, item._id, mediaType).subscribe({
      next: (data: any) => {
        if (data.code === "200") {
          console.log('Historique mis à jour avec le type :', mediaType);
        }
      }
    });
  }

  nextPage() { if (this.hasNext()) { this.currentPage++; this.updateDisplay(); window.scrollTo({top:0, behavior:'smooth'}); } }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.updateDisplay(); window.scrollTo({top:0, behavior:'smooth'}); } }
  hasNext(): boolean { return (this.currentPage * this.pageSize) < this.filteredContent.length; }

  onClickGoContent(item: any) {
    if (item.type === 'Série') this.moviesService.goSerie(item.slug);
    else this.moviesService.goMovie(item.slug);
  }
}
