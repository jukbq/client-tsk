import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articleCategoryByTypeIdResolver } from './article-category-by-type-id.resolver';

describe('articleCategoryByTypeIdResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articleCategoryByTypeIdResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
