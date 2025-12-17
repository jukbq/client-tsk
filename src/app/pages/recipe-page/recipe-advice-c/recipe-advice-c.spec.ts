import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeAdviceC } from './recipe-advice-c';

describe('RecipeAdviceC', () => {
  let component: RecipeAdviceC;
  let fixture: ComponentFixture<RecipeAdviceC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeAdviceC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeAdviceC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
