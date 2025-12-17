import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayAds } from './display-ads';

describe('DisplayAds', () => {
  let component: DisplayAds;
  let fixture: ComponentFixture<DisplayAds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayAds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayAds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
