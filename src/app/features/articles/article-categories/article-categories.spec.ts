import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleCategories } from './article-categories';

describe('ArticleCategories', () => {
  let component: ArticleCategories;
  let fixture: ComponentFixture<ArticleCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
