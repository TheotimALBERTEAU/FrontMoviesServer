import {Component, HostListener, signal, ElementRef} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';import { CommonModule } from '@angular/common';
import { Auth } from './services/Users/auth';
import {ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private router: Router,
              public authService: Auth,
              private eRef: ElementRef,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.authService.authChanged.subscribe(() => {
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    });
    this.authService.checkAuth().subscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (this.isProfileMenuOpen && !targetElement.closest('.profile-container')) {
      this.isProfileMenuOpen = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }

  public isProfileMenuOpen = false;

  protected readonly title = signal('FrontMovies');

  OnClickGoHome() {
    this.router.navigate(['/movies']);
  }

  OnClickGoLogin() {
    this.router.navigate(['/login']);
  }

  OnClickGoSignup() {
    this.router.navigate(['/signup']);
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  onLogout() {
    this.authService.logout().subscribe(() => {
      this.isProfileMenuOpen = false;
      this.router.navigate(['/login']);
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    });
  }
}
