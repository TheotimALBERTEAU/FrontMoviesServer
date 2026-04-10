import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriePage } from './serie-page';

describe('SeriePage', () => {
  let component: SeriePage;
  let fixture: ComponentFixture<SeriePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeriePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
