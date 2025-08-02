import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articlesByCategoryidResolver } from './articles-by-categoryid.resolver';

describe('articlesByCategoryidResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articlesByCategoryidResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
