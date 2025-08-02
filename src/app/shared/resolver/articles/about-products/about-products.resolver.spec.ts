import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { aboutProductsResolver } from './about-products.resolver';

describe('aboutProductsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => aboutProductsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
