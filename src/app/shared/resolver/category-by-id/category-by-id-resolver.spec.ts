import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { categoryByIdResolver } from './category-by-id-resolver';

describe('categoryByIdResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => categoryByIdResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
