import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationDetails } from './consultation-details';

describe('ConsultationDetails', () => {
  let component: ConsultationDetails;
  let fixture: ComponentFixture<ConsultationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationDetails]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
