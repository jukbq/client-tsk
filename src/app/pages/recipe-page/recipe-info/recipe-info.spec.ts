import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeInfo } from './recipe-info';

describe('RecipeInfo', () => {
  let component: RecipeInfo;
  let fixture: ComponentFixture<RecipeInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
