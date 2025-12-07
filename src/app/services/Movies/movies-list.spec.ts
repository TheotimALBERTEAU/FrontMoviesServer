import { TestBed } from '@angular/core/testing';

import { MoviesList } from './movies-list';

describe('MoviesList', () => {
  let service: MoviesList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoviesList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
