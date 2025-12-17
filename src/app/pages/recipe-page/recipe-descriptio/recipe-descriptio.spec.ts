import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeDescriptio } from './recipe-descriptio';

describe('RecipeDescriptio', () => {
  let component: RecipeDescriptio;
  let fixture: ComponentFixture<RecipeDescriptio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeDescriptio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeDescriptio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
