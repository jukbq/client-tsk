import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Soft404 } from './soft-404';

describe('Soft404', () => {
  let component: Soft404;
  let fixture: ComponentFixture<Soft404>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Soft404]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Soft404);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
