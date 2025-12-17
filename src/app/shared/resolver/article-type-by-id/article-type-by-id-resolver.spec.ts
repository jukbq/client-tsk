import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articleTypeByIdResolver } from './article-type-by-id-resolver';

describe('articleTypeByIdResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articleTypeByIdResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
