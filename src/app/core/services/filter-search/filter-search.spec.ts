import { TestBed } from '@angular/core/testing';

import { FilterSearch } from './filter-search';

describe('FilterSearch', () => {
  let service: FilterSearch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterSearch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
