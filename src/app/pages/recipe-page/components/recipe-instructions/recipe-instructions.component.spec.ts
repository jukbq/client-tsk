import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeInstructionsComponent } from './recipe-instructions.component';

describe('RecipeInstructionsComponent', () => {
  let component: RecipeInstructionsComponent;
  let fixture: ComponentFixture<RecipeInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeInstructionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
