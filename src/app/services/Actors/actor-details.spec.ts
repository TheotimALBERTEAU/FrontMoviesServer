import { TestBed } from '@angular/core/testing';

import { ActorDetails } from './actor-details';

describe('ActorDetails', () => {
  let service: ActorDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActorDetails);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
