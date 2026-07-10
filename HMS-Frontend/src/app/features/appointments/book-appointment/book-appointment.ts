import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PatientService } from '../../../core/services/patient';
import { EmployeeService } from '../../../core/services/employee';
import { AppointmentService } from '../../../core/services/appointment';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-appointment.html',
  styleUrls: ['./book-appointment.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookAppointment implements OnInit {
  // Store patients, doctors and available slots
  patients: any[] = [];
  doctors: any[] = [];
  filteredDoctors: any[] = [];
  availableSlots: string[] = [];

  // UI state flags
  isSubmitting = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;
  noSlotsError = false;

  // Form related variables
  appointmentForm: any;
  selectedDoctor: any = null;
  minDate = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly patientService: PatientService,
    private readonly employeeService: EmployeeService,
    private readonly appointmentService: AppointmentService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService
  ) {
    // Initialize appointment booking form
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      department: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      reason: ['', Validators.maxLength(500)],
      notes: ['', Validators.maxLength(500)],
      symptoms: ['', Validators.maxLength(500)],
      appointmentType: ['', Validators.required],
      priority: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      visitMode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Prevent selecting previous dates
    this.minDate = new Date().toISOString().split('T')[0];

    // Load initial data
    this.loadPatients();
    this.loadDoctors();

    // Filter doctors when department changes
    this.appointmentForm.get('department')?.valueChanges.subscribe(() => {
      this.filterDoctors();
    });

    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.filterDoctors();
    });
  }

  // Fetch all patients
  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response) => {
        console.log(response);

        this.patients = response.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.cdr.detectChanges();
      }
    });
  }

  // Fetch all doctors
  loadDoctors(): void {
    this.employeeService.getDoctors().subscribe({
      next: (response) => {
        console.log(response);

        this.doctors = response.data;

        console.log('Doctors Array:', this.doctors);

        if (this.appointmentForm.get('department')?.value) {
          this.filterDoctors();
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.doctors = [];
        this.filteredDoctors = [];
        this.cdr.detectChanges();
      }
    });
  }

  // Show doctors belonging to selected department who have joined by selected date
  filterDoctors(): void {
    const department = this.appointmentForm.get('department')?.value;
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    console.log('Selected Department:', department);
    console.log('All Doctors:', this.doctors);

    this.filteredDoctors = this.doctors.filter(
      (doctor) => doctor.department === department && this.hasDoctorJoinedByDate(doctor, appointmentDate)
    );

    // Reset doctor and slot selection
    this.appointmentForm.get('doctorId')?.setValue('');
    this.appointmentForm.get('appointmentTime')?.setValue('');
    this.selectedDoctor = null;
    this.availableSlots = [];
    this.noSlotsError = false;

    this.cdr.detectChanges();
  }

  onAppointmentDateChange(): void {
    this.filterDoctors();
    this.fetchAvailableSlots();
  }

  // Load available slots for selected doctor and date
  fetchAvailableSlots(): void {
    const doctorId = this.appointmentForm.get('doctorId')?.value;

    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    if (!doctorId || !appointmentDate) {
      return;
    }

    // Prevent selecting past dates
    const selectedDate = new Date(appointmentDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.availableSlots = [];
      this.noSlotsError = true;

      this.toastService.show('Cannot select past dates', 'error');
      this.cdr.detectChanges();

      return;
    }

    const year = Number.parseInt(appointmentDate.split('-')[0], 10);

    if (year < 2000) {
      return;
    }

    this.appointmentService.getAvailableSlots(doctorId, appointmentDate).subscribe({
      next: (response) => {
        console.log(response);

        let slots = response.data || [];

        const selectedDateObj = new Date(appointmentDate);

        const currentDate = new Date();

        const isToday = selectedDateObj.toDateString() === currentDate.toDateString();

        // Hide already passed slots for today's bookings
        if (isToday) {
          const currentTime = new Date();

          // Keep 15 minute buffer
          currentTime.setMinutes(currentTime.getMinutes() + 15);

          slots = slots.filter((slot: string) => {
            const [hours, minutes] = slot.split(':').map(Number);

            const slotTime = new Date();

            slotTime.setHours(hours, minutes, 0, 0);

            return slotTime > currentTime;
          });
        }

        this.availableSlots = slots;

        if (this.availableSlots.length === 0) {
          this.noSlotsError = true;

          this.toastService.show('No slots available for the selected date.', 'error');
        } else {
          this.noSlotsError = false;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Slots error:', error);

        this.availableSlots = [];
        this.noSlotsError = true;

        this.toastService.show(error?.error?.message || 'No slots available for the selected date.', 'error');

        this.cdr.detectChanges();
      }
    });
  }

  // Update selected doctor and refresh slots
  onDoctorChange(): void {
    const doctorId = this.appointmentForm.get('doctorId')?.value;

    console.log(this.selectedDoctor);

    this.selectedDoctor = this.filteredDoctors.find((doctor: any) => doctor._id === doctorId);

    // Reset slot selection when doctor changes
    this.appointmentForm.get('appointmentTime')?.setValue('');

    this.availableSlots = [];
    this.noSlotsError = false;

    this.cdr.detectChanges();

    this.fetchAvailableSlots();

    console.log(this.selectedDoctor);
  }

  private hasDoctorJoinedByDate(doctor: any, appointmentDate: string): boolean {
    if (!appointmentDate || !doctor?.joiningDate) {
      return Boolean(appointmentDate);
    }

    return this.getDateOnly(appointmentDate) >= this.getDateOnly(doctor.joiningDate);
  }

  private getDateOnly(date: string): number {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    return dateOnly.getTime();
  }

  // Submit appointment booking request
  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();

      if (this.appointmentForm.get('appointmentDate')?.valid && this.availableSlots.length === 0) {
        this.noSlotsError = true;
      }

      return;
    }

    if (this.availableSlots.length === 0) {
      this.noSlotsError = true;

      this.cdr.detectChanges();

      return;
    }

    this.isSubmitting = true;

    // Convert symptoms text into array
    const formData = {
      ...this.appointmentForm.value,
      symptoms: this.appointmentForm.value.symptoms?.split(',').map((symptom: string) => symptom.trim())
    };

    console.log(formData);

    this.appointmentService.bookAppointment(formData).subscribe({
      next: (response) => {
        console.log(response);

        this.toastService.show('Appointment booked successfully', 'success');

        // Reset form after successful booking
        this.appointmentForm.reset({
          appointmentType: 'CONSULTATION',
          priority: 'NORMAL',
          paymentStatus: 'PENDING',
          visitMode: 'OFFLINE',
          consultationFee: 0
        });

        this.availableSlots = [];
        this.filteredDoctors = [];
        this.isSubmitting = false;
      },
      error: (error) => {
        console.log(error);

        this.isSubmitting = false;

        this.toastService.show(error?.error?.message || 'Failed to book appointment.', 'error');
        this.cdr.detectChanges();
      }
    });
  }
}
