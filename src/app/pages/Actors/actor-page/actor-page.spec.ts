import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorPage } from './actor-page';

describe('ActorPage', () => {
  let component: ActorPage;
  let fixture: ComponentFixture<ActorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
