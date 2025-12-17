import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { dishesAllResolver } from './dishes-all-resolver';

describe('dishesAllResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => dishesAllResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
