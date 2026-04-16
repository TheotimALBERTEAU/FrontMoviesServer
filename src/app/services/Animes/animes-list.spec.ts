import { TestBed } from '@angular/core/testing';

import { AnimesList } from './animes-list';

describe('AnimesList', () => {
  let service: AnimesList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimesList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
