import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeHeader } from './recipe-header';

describe('RecipeHeader', () => {
  let component: RecipeHeader;
  let fixture: ComponentFixture<RecipeHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
