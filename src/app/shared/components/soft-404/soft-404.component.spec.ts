import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Soft404Component } from './soft-404.component';

describe('Soft404Component', () => {
  let component: Soft404Component;
  let fixture: ComponentFixture<Soft404Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Soft404Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Soft404Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
