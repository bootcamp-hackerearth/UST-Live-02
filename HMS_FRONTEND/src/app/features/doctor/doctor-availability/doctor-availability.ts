import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { EmployeeService } from '../../../core/services/employee';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-doctor-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-availability.html',
  styleUrls: ['./doctor-availability.css']
})
export class DoctorAvailability implements OnInit {
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  availabilityForm: any;

  workingDays = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly cdr: ChangeDetectorRef
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
        const availability = response?.data || {};

        this.availabilityForm.patchValue({
          workingDays: availability.workingDays || [],
          startTime: availability.startTime || '',
          endTime: availability.endTime || '',
          slotDuration: availability.slotDuration || 15,
          breakStartTime: availability.breakStartTime || '',
          breakEndTime: availability.breakEndTime || '',
          maxPatientsPerDay: availability.maxPatientsPerDay || 40,
          isAvailable: availability.isAvailable ?? true
        });

        this.cdr.detectChanges();
      },

      error: (error) => {
        this.errorMessage = getApiErrorMessage(error, 'Unable to load doctor availability');
        this.cdr.detectChanges();
      }
    });
  }

  // Add or remove a working day
  toggleDay(day: string): void {
    const currentDays = this.availabilityForm.value.workingDays || [];

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
    this.errorMessage = '';
    this.successMessage = '';

    if (this.availabilityForm.invalid) {
      this.availabilityForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required availability fields';

      return;
    }

    if (!this.hasValidTimeRange()) {
      this.errorMessage = 'End time must be after start time';

      return;
    }

    this.isSubmitting = true;
    const availabilityData = {
      ...this.availabilityForm.value,
      workingDays: this.availabilityForm.value.workingDays || [],
      slotDuration: Number(this.availabilityForm.value.slotDuration),
      maxPatientsPerDay: Number(this.availabilityForm.value.maxPatientsPerDay)
    };

    this.employeeService
      .updateDoctorAvailability(availabilityData)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Availability updated successfully';

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = getApiErrorMessage(error, 'Unable to update availability');

          this.cdr.detectChanges();
        }
      });
  }

  private hasValidTimeRange(): boolean {
    const startTime = this.availabilityForm.value.startTime;
    const endTime = this.availabilityForm.value.endTime;

    if (!startTime || !endTime) {
      return true;
    }

    return this.toMinutes(endTime) > this.toMinutes(startTime);
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }
}
