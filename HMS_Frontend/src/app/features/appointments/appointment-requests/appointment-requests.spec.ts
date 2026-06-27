import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentRequestsComponent } from './appointment-requests';

describe('AppointmentRequestsComponent', () => {
  let component: AppointmentRequestsComponent;
  let fixture: ComponentFixture<AppointmentRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentRequestsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
