import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsensePopupComponent } from './adsense-popup.component';

describe('AdsensePopupComponent', () => {
  let component: AdsensePopupComponent;
  let fixture: ComponentFixture<AdsensePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsensePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdsensePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
