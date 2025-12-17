import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCarousel } from './recipe-carousel';

describe('RecipeCarousel', () => {
  let component: RecipeCarousel;
  let fixture: ComponentFixture<RecipeCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
