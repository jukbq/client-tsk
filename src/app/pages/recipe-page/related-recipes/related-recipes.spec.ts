import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedRecipes } from './related-recipes';

describe('RelatedRecipes', () => {
  let component: RelatedRecipes;
  let fixture: ComponentFixture<RelatedRecipes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedRecipes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedRecipes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
