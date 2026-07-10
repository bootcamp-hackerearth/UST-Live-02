import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
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
  readonly isSubmitting = signal(false);

  availabilityForm: any;

  readonly workingDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly toast: ToastService
  ) {
    this.availabilityForm = this.fb.group({
      workingDays: [[]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      slotDuration: [15, Validators.required],
      breakStartTime: [''],
      breakEndTime: [''],
      maxPatientsPerDay: [40, Validators.required],
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

    this.isSubmitting.set(true);

    this.employeeService.updateDoctorAvailability(this.availabilityForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);

        this.toast.success('Availability updated successfully');
      },
      error: (error) => {
        console.log(error);
        this.toast.error(error?.error?.message || 'Unable to update availability');

        this.isSubmitting.set(false);
      }
    });
  }
}
