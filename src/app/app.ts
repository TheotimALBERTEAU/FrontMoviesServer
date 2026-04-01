import { Component, HostListener, signal, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from './services/Users/auth';
import { MoviesList } from './services/Movies/movies-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  @ViewChild('centralInput') centralInput!: ElementRef;

  public isSearchOpen = false;
  public isProfileMenuOpen = false;
  public searchQuery = '';
  public results: any[] = [];
  public isLoading = false;

  constructor(private router: Router,
              public authService: Auth,
              private cdr: ChangeDetectorRef,
              public moviesService: MoviesList,) {
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
    // Focus automatique sur la barre centrale
    setTimeout(() => {
      this.centralInput?.nativeElement.focus();
    }, 50);
  }

  closeSearch() {
    this.isSearchOpen = false;
    this.searchQuery = '';
    this.results = [];
    this.cdr.detectChanges();
  }

  onSearchChange(event: any) {
    if (this.searchQuery.length >= 2) {
      this.isLoading = true; // On lance le chargement
      this.results = []; // On vide les anciens résultats pendant le "load"

      this.moviesService.searchMovies(this.searchQuery).subscribe({
        next: (res) => {
          if (res && res.code === "200") {
            // On attend 400ms (0.4s) avant d'afficher pour simuler le travail
            setTimeout(() => {
              this.results = res.data;
              this.isLoading = false; // On arrête le chargement
              this.cdr.detectChanges();
            }, 400);
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error("Erreur recherche :", err);
        }
      });
    } else {
      this.results = [];
      this.isLoading = false;
    }
  }

  OnClickGoHome() { this.router.navigate(['/movies']); }
  OnClickGoLogin() { this.router.navigate(['/login']); }
  OnClickGoSignup() { this.router.navigate(['/signup']); }
  toggleProfileMenu() { this.isProfileMenuOpen = !this.isProfileMenuOpen; }
  onLogout() {
    this.authService.logout().subscribe(() => {
      this.isProfileMenuOpen = false;
      this.router.navigate(['/login']);
    });
  }
}
