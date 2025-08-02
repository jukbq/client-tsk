import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articleCategoryByIdResolver } from './article-category-by-id.resolver';

describe('articleCategoryByIdResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articleCategoryByIdResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
