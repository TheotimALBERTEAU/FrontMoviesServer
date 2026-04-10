import { TestBed } from '@angular/core/testing';

import { SeriesList } from './series-list';

describe('SeriesList', () => {
  let service: SeriesList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeriesList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
