import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieListPage } from './movie-list-page';

describe('MovieListPage', () => {
  let component: MovieListPage;
  let fixture: ComponentFixture<MovieListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
