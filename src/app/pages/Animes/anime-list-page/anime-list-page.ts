import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AnimesList } from '../../../services/Animes/animes-list';
import { CommonModule } from '@angular/common';
import { GenreService } from '../../../services/Genre/genre-service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-anime-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anime-list-page.html',
  styleUrl: './anime-list-page.css',
})
export class AnimeListPage implements OnInit {
  public allAnimes: any[] = [];
  public filteredAnimes: any[] = [];
  public displayedAnimes: any[] = [];
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
    'top_rated': 'Mieux notées',
    'az': 'Nom A-Z',
    'za': 'Nom Z-A'
  };

  constructor(
    private animesService: AnimesList,
    private cdr: ChangeDetectorRef,
    private genreService: GenreService,
    private route: ActivatedRoute,
    private router: Router,
    private eRef: ElementRef,
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    const toolbar = this.eRef.nativeElement.querySelector('.filters-toolbar');
    if (toolbar && !toolbar.contains(event.target)) {
      this.openFilter = null;
    }
  }

  ngOnInit() {
    const categories = ['Action', 'Animation', 'Comédie', 'Crime', 'Horreur'];

    this.animesService.getAnimes().subscribe({
      next: data => {
        if (data.code === "200") {
          this.allAnimes = data.data;
          this.generateDynamicOptions();

          this.route.queryParams.subscribe(params => {
            this.activeFilters.type = params['type'] || 'Animé';
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

    this.allAnimes.forEach(s => {
      if (s.type) types.add(s.type);
      if (s.genre) s.genre.forEach((g: string) => genres.add(g));
      if (s.year) years.add(Number(s.year));
    });

    this.dynamicOptions.types = Array.from(types).sort();
    this.dynamicOptions.genres = Array.from(genres).sort();
    const uniqueYears = Array.from(years).sort((a, b) => b - a);
    const yearLabels = uniqueYears.map(y => y >= 2000 ? y.toString() : 'Ancien');
    this.dynamicOptions.years = Array.from(new Set(yearLabels));
  }

  toggleFilterValue(key: 'type' | 'release' | 'vote_average', value: string) {
    (this.activeFilters as any)[key] = (this.activeFilters as any)[key] === value ? '' : value;
  }

  toggleGenre(g: string) {
    const i = this.activeFilters.genre.indexOf(g);
    if (i > -1) {
      this.activeFilters.genre.splice(i, 1);
    } else {
      this.activeFilters.genre.push(g);
    }
  }

  clearCategory(key: string) {
    if (key === 'genre') {
      this.activeFilters.genre = [];
    } else {
      (this.activeFilters as any)[key] = '';
    }
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
    this.router.navigate(['/animes'], { queryParams });
    this.openFilter = null;
  }

  applyFilters() {
    let result = [...this.allAnimes];

    if (this.activeFilters.type) result = result.filter(m => m.type === this.activeFilters.type);
    if (this.activeFilters.genre.length) {
      result = result.filter(s => this.activeFilters.genre.some(g => s.genre.includes(g)));
    }

    if (this.activeFilters.release) {
      if (this.activeFilters.release === 'Ancien') {
        result = result.filter(s => Number(s.year) < 2000);
      } else {
        result = result.filter(s => s.year.toString() === this.activeFilters.release);
      }
    }

    if (this.activeFilters.vote_average) {
      const filterVal = parseInt(this.activeFilters.vote_average);
      result = result.filter(s => Math.floor(parseFloat(s.rating)) === filterVal);
    }

    // Logique de Tri
    if (this.activeFilters.sort === 'random') {
      result = result.sort(() => Math.random() - 0.5);
    } else if (this.activeFilters.sort === 'created_at') {
      result =  result.sort((a, b) => {return b._id.toString().localeCompare(a._id.toString());});
    } else if (this.activeFilters.sort === 'release_year') {
      result = result.sort((a, b) => Number(b.year) - Number(a.year));
    } else if (this.activeFilters.sort === 'top_rated') {
      result = result.sort((a, b) => b.rating - a.rating);
    } else if (this.activeFilters.sort === 'az') {
      result = result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.activeFilters.sort === 'za') {
      result = result.sort((a, b) => b.title.localeCompare(a.title));
    }

    this.filteredAnimes = result;
    this.currentPage = 1;
    this.updateDisplay();
  }

  updateDisplay() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedAnimes = this.filteredAnimes.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
    if (this.currentPage > 1) window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  // --- NAVIGATION (CORRIGE TS2551) ---

  nextPage() { if (this.hasNext()) { this.currentPage++; this.updateDisplay(); } }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.updateDisplay(); } }
  hasNext(): boolean { return (this.currentPage * this.pageSize) < this.filteredAnimes.length; }

  onClickGoAnime(slug: string) { this.animesService.goAnime(slug); }

  onClickGoGenre(genre: string) {
    this.router.navigate(['/animes'], { queryParams: { genre: genre } });
  }
}
