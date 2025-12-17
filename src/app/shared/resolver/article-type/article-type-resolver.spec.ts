import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articleTypeResolver } from './article-type-resolver';

describe('articleTypeResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articleTypeResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
