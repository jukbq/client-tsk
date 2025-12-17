import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articleCategotyByTypeIdResolver } from './article-categoty-by-type-id-resolver';

describe('articleCategotyByTypeIdResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articleCategotyByTypeIdResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
