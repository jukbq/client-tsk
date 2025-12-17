import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesHome } from './articles-home';

describe('ArticlesHome', () => {
  let component: ArticlesHome;
  let fixture: ComponentFixture<ArticlesHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticlesHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
