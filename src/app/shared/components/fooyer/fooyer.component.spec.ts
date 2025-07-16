import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooyerComponent } from './fooyer.component';

describe('FooyerComponent', () => {
  let component: FooyerComponent;
  let fixture: ComponentFixture<FooyerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooyerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
