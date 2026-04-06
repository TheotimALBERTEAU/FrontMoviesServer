import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorsListPage } from './actors-list-page';

describe('ActorsListPage', () => {
  let component: ActorsListPage;
  let fixture: ComponentFixture<ActorsListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorsListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorsListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
