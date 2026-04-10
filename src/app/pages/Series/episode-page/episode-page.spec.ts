import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodePage } from './episode-page';

describe('EpisodePage', () => {
  let component: EpisodePage;
  let fixture: ComponentFixture<EpisodePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpisodePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
