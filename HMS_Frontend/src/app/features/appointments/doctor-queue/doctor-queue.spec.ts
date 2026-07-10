import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorQueue } from './doctor-queue';

describe('DoctorQueue', () => {
  let component: DoctorQueue;
  let fixture: ComponentFixture<DoctorQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorQueue]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
