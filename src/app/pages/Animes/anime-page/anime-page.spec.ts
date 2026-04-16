import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimePage } from './anime-page';

describe('AnimePage', () => {
  let component: AnimePage;
  let fixture: ComponentFixture<AnimePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
