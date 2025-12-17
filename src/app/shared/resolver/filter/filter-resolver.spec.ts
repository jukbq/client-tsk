import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { filterResolver } from './filter-resolver';

describe('filterResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => filterResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
