import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingAppointments } from './pending-appointments';

describe('PendingAppointments', () => {
  let component: PendingAppointments;
  let fixture: ComponentFixture<PendingAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingAppointments]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingAppointments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
