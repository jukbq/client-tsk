import { TestBed } from '@angular/core/testing';

import { AboutProductsService } from './about-products.service';

describe('AboutProductsService', () => {
  let service: AboutProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AboutProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
