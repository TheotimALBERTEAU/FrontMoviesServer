import { TestBed } from '@angular/core/testing';

import { MoviesProgresses } from './movies-progresses';

describe('MoviesProgresses', () => {
  let service: MoviesProgresses;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoviesProgresses);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
