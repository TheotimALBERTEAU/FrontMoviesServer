import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
import { MoviesList} from '../../../services/Movies/movies-list';
import {ActivatedRoute} from '@angular/router';
import { ChangeDetectorRef} from '@angular/core';
import {ActorsList} from '../../../services/Actors/actors-list';
import {forkJoin} from 'rxjs';
import {CommonModule} from '@angular/common';
import {Search} from '../../../services/Search/search';
import {SeriesList} from '../../../services/Series/series-list';

@Component({
  selector: 'app-search-page',
  imports: [CommonModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage implements OnInit {
  public query: string = '';
  public allMediaContent: any[] = []; // Source brute (Films + Séries)
  public filteredMediaContent: any[] = []; // Liste après filtres
  public resultsActorsList: any[] = [];

  // Système de Filtres
  public openFilter: string | null = null;
  public activeFilters = { type: '', genre: [] as string[], release: '', vote_average: '', sort: 'created_at' };

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

  constructor(
    private moviesService: MoviesList,
    private seriesService: SeriesList,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private actorsService: ActorsList,
    private searchService: Search,
    private eRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.querySelector('.filters-toolbar')?.contains(event.target)) {
      this.openFilter = null;
    }
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.query = params['query'];
      if (this.query) {
        this.resetFilters();
        this.loadResults();
      }
    });
  }

  loadResults() {
    forkJoin({
      movies: this.searchService.searchMovies(this.query),
      series: this.searchService.searchSeries(this.query),
      actors: this.searchService.searchActors(this.query)
    }).subscribe({
      next: (res) => {
        const movies = res.movies.code === "200" ? res.movies.data : [];
        const series = res.series.code === "200" ? res.series.data : [];

        this.allMediaContent = [...movies, ...series];
        this.resultsActorsList = res.actors.code === "200" ? res.actors.data : [];

        this.generateDynamicOptions();
        this.applyFilters();
      }
    });
  }

  generateDynamicOptions() {
    const years = new Set<number>();
    const genres = new Set<string>();

    this.allMediaContent.forEach(item => {
      if (item.year) years.add(Number(item.year));
      if (item.genre) item.genre.forEach((g: string) => genres.add(g));
    });

    this.dynamicOptions.genres = Array.from(genres).sort();
    const uniqueYears = Array.from(years).sort((a, b) => b - a);
    this.dynamicOptions.years = uniqueYears.map(y => y >= 2000 ? y.toString() : 'Ancien');
    this.dynamicOptions.years = Array.from(new Set(this.dynamicOptions.years));
  }

  // --- Logique des filtres ---
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
    this.applyFilters();
  }

  resetFilters() {
    this.activeFilters = { type: '', genre: [], release: '', vote_average: '', sort: 'created_at' };
  }

  submitFilters() {
    this.applyFilters();
    this.openFilter = null;
  }

  applyFilters() {
    let result = [...this.allMediaContent];

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
      result = result.filter(m => Math.floor(m.rating || m.imdb_rating) === filterVal);
    }

    // Tri
    this.sortResults(result);
  }

  sortResults(result: any[]) {
    if (this.activeFilters.sort === 'random') result.sort(() => Math.random() - 0.5);
    else if (this.activeFilters.sort === 'created_at') result.sort((a, b) => {return b._id.toString().localeCompare(a._id.toString());});
    else if (this.activeFilters.sort === 'release_year') result.sort((a, b) => Number(b.year) - Number(a.year));
    else if (this.activeFilters.sort === 'top_rated') result.sort((a, b) => (b.rating || b.imdb_rating) - (a.rating || a.imdb_rating));
    else if (this.activeFilters.sort === 'az') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (this.activeFilters.sort === 'za') result.sort((a, b) => b.title.localeCompare(a.title));
    console.log('Exemple série:', this.filteredMediaContent[0]?.created_at);

    this.filteredMediaContent = result;
    this.cdr.detectChanges();
  }

  onClickGoMedia(media: any) {
    media.type === "Série" ? this.seriesService.goSerie(media.slug) : this.moviesService.goMovie(media.slug);
  }

  onClickGoActor(actorSlug: any) {
    this.actorsService.goActor(actorSlug);
  }
}
