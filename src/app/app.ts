import {Component, HostListener, signal, ElementRef} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';import { CommonModule } from '@angular/common'; // Obligatoire pour *ngIf
import { Auth } from './services/Users/auth'; // Vérifie le chemin de ton service

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
              private eRef: ElementRef) {
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
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
    });
  }
}
