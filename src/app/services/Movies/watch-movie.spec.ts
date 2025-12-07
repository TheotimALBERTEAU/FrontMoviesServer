import { TestBed } from '@angular/core/testing';

import { WatchMovie } from './watch-movie';

describe('WatchMovie', () => {
  let service: WatchMovie;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchMovie);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
