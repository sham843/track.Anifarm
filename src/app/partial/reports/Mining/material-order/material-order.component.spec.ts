import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialOrderComponent } from './material-order.component';

describe('MaterialOrderComponent', () => {
  let component: MaterialOrderComponent;
  let fixture: ComponentFixture<MaterialOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
