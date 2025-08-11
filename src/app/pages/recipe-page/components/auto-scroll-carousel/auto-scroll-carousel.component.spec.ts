import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoScrollCarouselComponent } from './auto-scroll-carousel.component';

describe('AutoScrollCarouselComponent', () => {
  let component: AutoScrollCarouselComponent;
  let fixture: ComponentFixture<AutoScrollCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoScrollCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoScrollCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
