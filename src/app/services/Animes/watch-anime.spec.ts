import { TestBed } from '@angular/core/testing';

import { WatchAnime } from './watch-anime';

describe('WatchAnime', () => {
  let service: WatchAnime;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchAnime);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
