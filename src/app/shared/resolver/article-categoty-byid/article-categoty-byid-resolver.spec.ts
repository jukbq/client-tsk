import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articleCategotyByidResolver } from './article-categoty-byid-resolver';

describe('articleCategotyByidResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articleCategotyByidResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
