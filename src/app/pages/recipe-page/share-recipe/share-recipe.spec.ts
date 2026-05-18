import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareRecipe } from './share-recipe';

describe('ShareRecipe', () => {
  let component: ShareRecipe;
  let fixture: ComponentFixture<ShareRecipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareRecipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareRecipe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
