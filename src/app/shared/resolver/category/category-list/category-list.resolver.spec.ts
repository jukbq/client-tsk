import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { categoryListResolver } from './category-list.resolver';

describe('categoryListResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => categoryListResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
