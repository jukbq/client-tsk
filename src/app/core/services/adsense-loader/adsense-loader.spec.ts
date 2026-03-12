import { TestBed } from '@angular/core/testing';

import { AdsenseLoader } from './adsense-loader';

describe('AdsenseLoader', () => {
  let service: AdsenseLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdsenseLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
