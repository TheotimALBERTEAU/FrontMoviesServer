import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeListPage } from './anime-list-page';

describe('AnimeListPage', () => {
  let component: AnimeListPage;
  let fixture: ComponentFixture<AnimeListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimeListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimeListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
