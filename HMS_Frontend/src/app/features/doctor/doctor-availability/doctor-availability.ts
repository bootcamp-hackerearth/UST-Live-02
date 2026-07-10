import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-doctor-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-availability.html',
  styleUrls: ['./doctor-availability.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorAvailability implements OnInit {
  isSubmitting = false;

  availabilityForm: any;

  workingDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService
  ) {
    this.availabilityForm = this.fb.group({
      workingDays: [[]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      slotDuration: [15, [Validators.required, Validators.min(5), Validators.max(240)]],
      breakStartTime: [''],
      breakEndTime: [''],
      maxPatientsPerDay: [40, [Validators.required, Validators.min(1), Validators.max(500)]],
      isAvailable: [true]
    });
  }

  // Load doctor availability on page load
  ngOnInit(): void {
    this.loadAvailability();
  }

  // Fetch doctor availability details
  loadAvailability(): void {
    this.employeeService.getDoctorAvailability().subscribe({
      next: (response: any) => {
        console.log(response);

        this.availabilityForm.patchValue({
          workingDays: response?.data?.workingDays,
          startTime: response?.data?.startTime,
          endTime: response?.data?.endTime,
          slotDuration: response?.data?.slotDuration,
          breakStartTime: response?.data?.breakStartTime,
          breakEndTime: response?.data?.breakEndTime,
          maxPatientsPerDay: response?.data?.maxPatientsPerDay,
          isAvailable: response?.data?.isAvailable
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // Add or remove a working day
  toggleDay(day: string): void {
    const currentDays = this.availabilityForm.value.workingDays;

    const exists = currentDays.includes(day);

    if (exists) {
      this.availabilityForm.patchValue({
        workingDays: currentDays.filter((d: string) => d !== day)
      });

      return;
    }

    this.availabilityForm.patchValue({
      workingDays: [...currentDays, day]
    });
  }

  // Save availability settings
  onSubmit(): void {
    if (this.availabilityForm.invalid) {
      this.availabilityForm.markAllAsTouched();

      return;
    }

    const { startTime, endTime, breakStartTime, breakEndTime } = this.availabilityForm.value;

    if (endTime <= startTime) {
      this.toast.error('End time must be after start time');
      return;
    }

    if (breakStartTime && breakEndTime && breakEndTime <= breakStartTime) {
      this.toast.error('Break end time must be after break start time');
      return;
    }

    if ((breakStartTime && !breakEndTime) || (!breakStartTime && breakEndTime)) {
      this.toast.error('Both break start and end time are required');
      return;
    }

    if (breakStartTime && (breakStartTime < startTime || breakEndTime > endTime)) {
      this.toast.error('Break time must be inside working hours');
      return;
    }

    this.isSubmitting = true;

    this.employeeService.updateDoctorAvailability(this.availabilityForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.cdr.detectChanges();

        this.toast.success('Availability updated successfully');
      },
      error: (error) => {
        console.log(error);
        this.toast.error(error?.error?.message || 'Unable to update availability');

        this.isSubmitting = false;

        this.cdr.detectChanges();
      }
    });
  }
}
