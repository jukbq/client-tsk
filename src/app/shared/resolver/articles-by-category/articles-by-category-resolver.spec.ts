import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articlesByCategoryResolver } from './articles-by-category-resolver';

describe('articlesByCategoryResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articlesByCategoryResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
