import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtricleList } from './atricle-list';

describe('AtricleList', () => {
  let component: AtricleList;
  let fixture: ComponentFixture<AtricleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtricleList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtricleList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
