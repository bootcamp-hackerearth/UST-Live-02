import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment';
import { EmployeeService } from '../../../core/services/employee';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-appointment.html',
  styleUrls: ['./edit-appointment.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAppointment implements OnInit {
  appointmentId = '';

  doctors: any[] = [];

  availableSlots: string[] = [];

  isSubmitting = false;

  noSlotsError = false;

  appointmentForm: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appointmentService: AppointmentService,
    private readonly employeeService: EmployeeService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.appointmentForm = this.fb.group({
      doctorEmployeeId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      timeSlot: ['', Validators.required],
      appointmentType: ['CONSULTATION', Validators.required],
      priority: ['NORMAL', Validators.required],
      paymentStatus: ['PENDING', Validators.required],
      visitMode: ['OFFLINE', Validators.required],
      status: ['BOOKED', Validators.required],
      reason: [''],
      notes: [''],
      symptoms: ['']
    });
  }

  // Load doctors and appointment details when page opens
  ngOnInit(): void {
    this.loadDoctors();

    this.appointmentForm.get('status')?.valueChanges.subscribe({
      next: (status: string) => {
        if (status === 'COMPLETED' || status === 'CANCELLED') {
          this.availableSlots = [];
          this.noSlotsError = false;
          this.appointmentForm.patchValue({ timeSlot: '' });
          this.cdr.markForCheck();
        } else {
          this.fetchAvailableSlots();
        }
      }
    });

    this.appointmentId = this.route.snapshot.paramMap.get('id') || '';

    if (this.appointmentId) {
      this.loadAppointment();
    }
  }

  // Get all doctors for dropdown
  loadDoctors(): void {
    this.employeeService.getDoctors().subscribe({
      next: (response) => {
        this.doctors = response.data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.log(error);
        this.cdr.markForCheck();
      }
    });
  }

  // Load appointment details and fill form
  loadAppointment(): void {
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (response) => {
        const appointment = response.data;

        const date = new Date(appointment.appointmentDate);

        const formattedDate =
          date.getFullYear() +
          '-' +
          String(date.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(date.getDate()).padStart(2, '0');

        console.log('FORMATTED DATE', formattedDate);

        this.appointmentForm.patchValue({
          doctorEmployeeId: appointment?.doctorEmployeeId?._id,
          appointmentDate: formattedDate,
          timeSlot: appointment?.timeSlot,
          appointmentType: appointment?.appointmentType,
          priority: appointment?.priority,
          paymentStatus: appointment?.paymentStatus,
          visitMode: appointment?.visitMode,
          status: appointment?.status,
          reason: appointment?.reason,
          notes: appointment?.notes,
          symptoms: appointment?.symptoms?.join(', ')
        });

        // Load slots only for active appointments
        if (appointment?.status !== 'COMPLETED' && appointment?.status !== 'CANCELLED') {
          this.fetchAvailableSlots();
        }

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.log(error);
        this.cdr.markForCheck();
      }
    });
  }

  // Get available slots for selected doctor and date
  fetchAvailableSlots(): void {
    const status = this.appointmentForm.get('status')?.value;

    // No slots needed for completed or cancelled appointments
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      return;
    }

    const doctorEmployeeId = this.appointmentForm.get('doctorEmployeeId')?.value;

    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    // Wait until doctor and date are selected
    if (!doctorEmployeeId || !appointmentDate) {
      return;
    }

    this.noSlotsError = false;

    this.availableSlots = [];
    this.cdr.markForCheck();

    this.appointmentService.getAvailableSlots(doctorEmployeeId, appointmentDate).subscribe({
      next: (response) => {
        let slots = response.data || [];

        // Remove already passed time slots if selected date is today
        const selectedDate = new Date(appointmentDate);

        const today = new Date();

        const isToday = selectedDate.toDateString() === today.toDateString();

        if (isToday) {
          const currentTime = new Date();

          // Keep 15 minutes buffer from current time
          currentTime.setMinutes(currentTime.getMinutes() + 15);

          slots = slots.filter((slot: string) => {
            const [hours, minutes] = slot.split(':').map(Number);

            const slotTime = new Date();

            slotTime.setHours(hours, minutes, 0, 0);

            return slotTime > currentTime;
          });
        }

        this.availableSlots = slots;

        // Show error if no slots are available
        if (this.availableSlots.length === 0) {
          this.noSlotsError = true;

          this.toastService.show('No slots available for the selected date.', 'error');
        } else {
          this.noSlotsError = false;
        }

        this.cdr.markForCheck();
      },
      error: (error) => {
        this.availableSlots = [];

        this.noSlotsError = true;

        this.toastService.show(error?.error?.message || 'Doctor is not available on this date.', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  // Update appointment details
  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();

      // Show slot error if date is selected but no slot is available
      if (this.appointmentForm.get('appointmentDate')?.valid && this.availableSlots.length === 0) {
        this.noSlotsError = true;
      }

      return;
    }

    // Prevent update when no slot is available
    if (
      this.availableSlots.length === 0 &&
      this.appointmentForm.get('status')?.value !== 'COMPLETED' &&
      this.appointmentForm.get('status')?.value !== 'CANCELLED'
    ) {
      this.noSlotsError = true;
      this.cdr.markForCheck();

      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    // Convert symptoms text into array before sending to backend
    const formData = {
      ...this.appointmentForm.value,
      symptoms: this.appointmentForm.value.symptoms?.split(',').map((symptom: string) => symptom.trim())
    };

    this.appointmentService.updateAppointment(this.appointmentId, formData).subscribe({
      next: (response) => {
        console.log(response);

        this.toastService.show('Appointment updated successfully', 'success');

        this.router.navigate(['/appointments']);

        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.log(error);

        this.isSubmitting = false;

        this.toastService.show(error?.error?.message || 'Failed to update appointment.', 'error');
        this.cdr.markForCheck();
      }
    });
  }
}
