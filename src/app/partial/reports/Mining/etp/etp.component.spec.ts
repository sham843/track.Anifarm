import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtpComponent } from './etp.component';

describe('EtpComponent', () => {
  let component: EtpComponent;
  let fixture: ComponentFixture<EtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EtpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
