import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private router: Router) {
  }

  protected readonly title = signal('FrontMovies');

  OnClickGoHome() {
    this.router.navigate(['/movies']);
  }
}
