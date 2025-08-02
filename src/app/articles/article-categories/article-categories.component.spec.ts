import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleCategoriesComponent } from './article-categories.component';

describe('ArticleCategoriesComponent', () => {
  let component: ArticleCategoriesComponent;
  let fixture: ComponentFixture<ArticleCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
