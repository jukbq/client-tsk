import { TestBed } from '@angular/core/testing';
import { RedirectCommand, ResolveFn } from '@angular/router';

import { articleTypeResolver } from './article-type.resolver';

describe('articleTypeResolver', () => {
  const executeResolver: ResolveFn<RedirectCommand | { data: any; url: string }> = (...resolverParameters) =>

    TestBed.runInInjectionContext(() => articleTypeResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
