import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakDownComponent } from './break-down.component';

describe('BreakDownComponent', () => {
  let component: BreakDownComponent;
  let fixture: ComponentFixture<BreakDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreakDownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreakDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
