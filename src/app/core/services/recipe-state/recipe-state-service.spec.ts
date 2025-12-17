import { TestBed } from '@angular/core/testing';

import { RecipeStateService } from './recipe-state-service';

describe('RecipeStateService', () => {
  let service: RecipeStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
