import { TestBed } from '@angular/core/testing';

import { ActorsList } from './actors-list';

describe('ActorsList', () => {
  let service: ActorsList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActorsList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
