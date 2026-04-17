import { Component, HostListener, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from './services/Users/auth';
import { MoviesList } from './services/Movies/movies-list';
import { SidebarService } from './services/sidebar';
import {Sidebar} from './sidebar/sidebar';
import {ActorsList} from './services/Actors/actors-list';
import {forkJoin} from 'rxjs';
import {Search} from './services/Search/search';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  @ViewChild('centralInput') centralInput!: ElementRef;

  public isSearchOpen = false;
  public isProfileMenuOpen = false;
  public searchQuery = '';
  public moviesResults: any[] = [];
  public seriesResults: any[] = [];
  public animesResults: any[] = [];
  public actorsResults: any[] = [];
  public allResults: any[] = [];
  public isLoading = false;

  constructor(private router: Router,
              public authService: Auth,
              private cdr: ChangeDetectorRef,
              public moviesService: MoviesList,
              public sidebarService: SidebarService,
              public actorsService: ActorsList,
              public searchService: Search) {
  }

  ngOnInit() {
    this.authService.authChanged.subscribe(() => {
      this.cdr.detectChanges();
    });
    this.authService.checkAuth().subscribe();
  }

  @HostListener('document:click', ['$event'])
  handleGlobalClicks(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.isProfileMenuOpen && !target.closest('.profile-wrapper')) {
      this.isProfileMenuOpen = false;
    }

    if (this.isSearchOpen && target.classList.contains('search-overlay')) {
      this.closeSearch();
    }
    this.cdr.detectChanges();
  }

  openSearch() {
    this.isSearchOpen = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.centralInput?.nativeElement.focus();
    }, 50);
  }

  closeSearch() {
    this.isSearchOpen = false;
    this.searchQuery = '';
    this.moviesResults = [];
    this.seriesResults = [];
    this.animesResults = [];
    this.actorsResults = [];
    this.allResults = [];
    this.cdr.detectChanges();
  }

  onSearchChange(event: any) {
    if (this.searchQuery.length >= 2) {
      this.isLoading = true;

      forkJoin({
        movies: this.searchService.searchMovies(this.searchQuery),
        series: this.searchService.searchSeries(this.searchQuery),
        animes: this.searchService.searchAnimes(this.searchQuery),
        actors: this.searchService.searchActors(this.searchQuery)
      }).subscribe({
        next: (res) => {
          const movies = res.movies.code === "200" ? res.movies.data : [];
          const series = res.series.code === "200" ? res.series.data : [];
          const animes = res.animes.code === "200" ? res.animes.data : [];
          const actors = res.actors.code === "200" ? res.actors.data : [];

          this.allResults = [...animes, ...series, ...movies].slice(0, 8);
          this.actorsResults = actors.slice(0, 4);

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          console.error("Erreur de recherche combinée :", err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.moviesResults = [];
      this.seriesResults = [];
      this.animesResults = [];
      this.actorsResults = [];
      this.allResults = [];
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  OnClickGoHome() { this.router.navigate(['/']); }
  OnClickGoLogin() { this.router.navigate(['/login']); }
  OnClickGoSignup() { this.router.navigate(['/signup']); }
  onClickGoSearchPage(query: string) {
    this.router.navigate([`/search/${query}`]);
    this.closeSearch()
  }
  toggleProfileMenu() { this.isProfileMenuOpen = !this.isProfileMenuOpen; }
  onLogout() {
    this.authService.logout().subscribe(() => {
      this.isProfileMenuOpen = false;
      this.router.navigate(['/login']);
    });
  }

  onClickGoProfilePage() {
    this.router.navigate(['/profile']);
  }
}
