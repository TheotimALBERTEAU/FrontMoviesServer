import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerieListPage } from './serie-list-page';

describe('SerieListPage', () => {
  let component: SerieListPage;
  let fixture: ComponentFixture<SerieListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SerieListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SerieListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
