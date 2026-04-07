import {Component, ChangeDetectorRef, ViewChild, ElementRef, HostListener, OnInit, OnDestroy} from '@angular/core';
import {ActorsList} from '../../../services/Actors/actors-list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actors-list-page',
  imports: [CommonModule],
  templateUrl: './actors-list-page.html',
  styleUrl: './actors-list-page.css',
})
export class ActorsListPage {
  public actors: any[] = [];
  public displayedActors: any[] = [];

  public currentPage = 1;
  public pageSize = 32;

  constructor(
    private actorsService: ActorsList,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadActors();
  }

  loadActors() {
    this.actorsService.getActors().subscribe({
      next: (data) => {
        if (data && data.code === "200") {
          this.actors = data.data;
          this.updateDisplay();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des acteurs', err);
      }
    });
  }

  updateDisplay() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.displayedActors = this.actors.slice(start, end);

    this.cdr.detectChanges();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage() {
    if (this.hasNext()) {
      this.currentPage++;
      this.updateDisplay();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplay();
    }
  }

  hasNext(): boolean {
    return (this.currentPage * this.pageSize) < this.actors.length;
  }

  onClickGoActor(slug: string) {
    this.actorsService.goActor(slug);
  }
}
