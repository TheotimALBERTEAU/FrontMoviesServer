import { Component } from '@angular/core';
import {Router} from '@angular/router';
import { SidebarService } from '../services/sidebar';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(public sidebarService: SidebarService,
              public router: Router,) {}

  onClickGoMovies(): void {
    this.router.navigate(['/movies']);
  }

  onClickGoActors(): void {
    this.router.navigate(['/actors']);
  }
}
