import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { lastRecipeResolver } from './last-recipe-resolver';

describe('lastRecipeResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => lastRecipeResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
