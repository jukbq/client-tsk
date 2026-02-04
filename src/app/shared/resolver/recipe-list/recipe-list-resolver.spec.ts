import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { recipeListResolver } from './recipe-list-resolver';

describe('recipeListResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => recipeListResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
