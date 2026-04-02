import {Component, ChangeDetectorRef, ViewChild, ElementRef, HostListener} from '@angular/core';
import {MoviesList} from '../../../services/Movies/movies-list';
import {Auth} from '../../../services/Users/auth'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  constructor(private moviesService: MoviesList,
              public authService: Auth,
              private cdr: ChangeDetectorRef) {}

  public progressedMovies: any[] = [];

  ngOnInit() {
    this.authService.checkAuth().subscribe(() => {
      const userId = this.authService.getUserId();
      if (userId) {
        this.loadMovies(userId);
      }
      this.cdr.detectChanges()
    });
  }

  loadMovies(userId: string) {
    this.moviesService.getMoviesProgresses(userId).subscribe((res: any) => {
      if (res && res.code === "200") {
        this.progressedMovies = res.data;
      }
      setTimeout(() => {
        this.checkButtons();
      }, 50);
      this.cdr.detectChanges();
    });
  }

  onClickGoMovie(slug: any) {
    this.moviesService.goMovie(slug);
  }

  @ViewChild('slider') slider!: ElementRef;

  canScrollLeft = false;
  canScrollRight = false;

  checkButtons() {
    if (!this.slider || !this.slider.nativeElement) return;

    const el = this.slider.nativeElement;
    this.canScrollLeft = el.scrollLeft > 2;
    const atTheEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
    this.canScrollRight = !atTheEnd;

    this.cdr.detectChanges();
  }

  scroll(direction: number) {
    const el = this.slider.nativeElement;
    const firstCard = el.querySelector('.progressed-movie-card');

    if (firstCard) {
      const cardWidth = firstCard.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(el).gap) || 16;
      const scrollAmount = cardWidth + gap;

      el.scrollLeft += (scrollAmount * direction);
      if (direction > 0) this.canScrollLeft = true;
      setTimeout(() => {
        this.checkButtons();
      }, 400);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkButtons();
  }
}
