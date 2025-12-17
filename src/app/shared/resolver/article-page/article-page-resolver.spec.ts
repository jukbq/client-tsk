import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { articlePageResolver } from './article-page-resolver';

describe('articlePageResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => articlePageResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
