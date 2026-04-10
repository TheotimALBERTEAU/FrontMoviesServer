import { TestBed } from '@angular/core/testing';

import { WatchSerie } from './watch-serie';

describe('WatchSerie', () => {
  let service: WatchSerie;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchSerie);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
