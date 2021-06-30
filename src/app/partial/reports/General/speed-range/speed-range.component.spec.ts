import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedRangeComponent } from './speed-range.component';

describe('SpeedRangeComponent', () => {
  let component: SpeedRangeComponent;
  let fixture: ComponentFixture<SpeedRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeedRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeedRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
