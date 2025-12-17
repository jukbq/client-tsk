import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesByTag } from './recipes-by-tag';

describe('RecipesByTag', () => {
  let component: RecipesByTag;
  let fixture: ComponentFixture<RecipesByTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesByTag]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipesByTag);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
