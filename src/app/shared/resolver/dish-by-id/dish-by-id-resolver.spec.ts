import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { dishByIdResolver } from './dish-by-id-resolver';

describe('dishByIdResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => dishByIdResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
