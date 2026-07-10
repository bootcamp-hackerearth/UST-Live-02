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
  noSlotsError = false;
  slotErrorMessage = '';
  doctorFilterMessage = '';

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
      reason: [''],
      notes: [''],
      symptoms: [''],
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
  }

  private getDateOnly(value: string | Date): Date {
    if (typeof value === 'string') {
      const datePart = value.includes('T') ? value.split('T')[0] : value;
      const [year, month, day] = datePart.split('-').map(Number);

      if (year && month && day) {
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);

        return date;
      }
    }

    const date = new Date(value);
    date.setHours(0, 0, 0, 0);

    return date;
  }

  private normalizeValue(value: any): string {
    return String(value ?? '').trim().toUpperCase();
  }

  private hasDoctorJoinedByDate(doctor: any, appointmentDate: string): boolean {
    if (!doctor?.joiningDate || !appointmentDate) {
      return false;
    }

    return this.getDateOnly(appointmentDate) >= this.getDateOnly(doctor.joiningDate);
  }

  // Fetch all patients
  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response) => {

        this.patients = response.data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cdr.detectChanges();
      }
    });
  }

  // Fetch all doctors
  loadDoctors(): void {
    this.employeeService.getDoctors().subscribe({
      next: (response) => {

        this.doctors = Array.isArray(response?.data) ? response.data : [];

        if (this.appointmentForm.get('department')?.value) {
          this.filterDoctors();
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.doctors = [];
        this.filteredDoctors = [];
        this.cdr.detectChanges();
      }
    });
  }

  // Show doctors belonging to selected department and joined by selected date
  filterDoctors(): void {
    const department = this.appointmentForm.get('department')?.value;
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    if (!department || !appointmentDate) {
      this.filteredDoctors = [];
      this.doctorFilterMessage = department ? 'Select appointment date to view available doctors.' : '';
    } else {
      this.filteredDoctors = this.doctors.filter(
        (doctor) =>
          this.normalizeValue(doctor.department) === this.normalizeValue(department) &&
          this.hasDoctorJoinedByDate(doctor, appointmentDate)
      );
      this.doctorFilterMessage =
        this.filteredDoctors.length === 0 ? 'No doctors available for selected date.' : '';
    }

    // Reset doctor and slot selection
    this.appointmentForm.get('doctorId')?.setValue('');
    this.selectedDoctor = null;
    this.appointmentForm.get('appointmentTime')?.setValue('');
    this.availableSlots = [];
    this.noSlotsError = false;
    this.slotErrorMessage = '';

    this.cdr.detectChanges();
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
      this.slotErrorMessage = 'Cannot select past dates';

      this.toastService.show(this.slotErrorMessage, 'error');
      this.cdr.detectChanges();

      return;
    }

    const year = Number.parseInt(appointmentDate.split('-')[0], 10);

    if (year < 2000) {
      return;
    }

    this.appointmentService.getAvailableSlots(doctorId, appointmentDate).subscribe({
      next: (response) => {

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
          this.slotErrorMessage = 'No slots available for the selected date.';

          this.toastService.show(this.slotErrorMessage, 'error');
        } else {
          this.noSlotsError = false;
          this.slotErrorMessage = '';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {

        this.availableSlots = [];
        this.noSlotsError = true;
        this.slotErrorMessage = error?.error?.message || 'No slots available for the selected date.';

        this.toastService.show(this.slotErrorMessage, 'error');

        this.cdr.detectChanges();
      }
    });
  }

  onAppointmentDateChange(): void {
    this.filterDoctors();
  }

  // Update selected doctor and refresh slots
  onDoctorChange(): void {
    const doctorId = this.appointmentForm.get('doctorId')?.value;

    this.selectedDoctor = this.filteredDoctors.find((doctor: any) => doctor._id === doctorId);

    // Reset slot selection when doctor changes
    this.appointmentForm.get('appointmentTime')?.setValue('');

    this.availableSlots = [];
    this.noSlotsError = false;
    this.slotErrorMessage = '';

    this.cdr.detectChanges();

    this.fetchAvailableSlots();

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
      this.slotErrorMessage = this.slotErrorMessage || 'No slots available for the selected date.';

      this.cdr.detectChanges();

      return;
    }

    this.isSubmitting = true;

    // Convert symptoms text into array
    const formData = {
      ...this.appointmentForm.value,
      symptoms: this.appointmentForm.value.symptoms?.split(',').map((symptom: string) => symptom.trim())
    };

    this.appointmentService.bookAppointment(formData).subscribe({
      next: (response) => {

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
        this.noSlotsError = false;
        this.slotErrorMessage = '';
        this.isSubmitting = false;
      },
      error: (error) => {

        this.isSubmitting = false;

        const message = error?.error?.message || 'Failed to book appointment.';

        if (error?.error?.errorCode === 'DOCTOR_JOINING_DATE_NOT_REACHED') {
          this.noSlotsError = true;
          this.slotErrorMessage = message;
        }

        this.toastService.show(message, 'error');
        this.cdr.detectChanges();
      }
    });
  }
}



