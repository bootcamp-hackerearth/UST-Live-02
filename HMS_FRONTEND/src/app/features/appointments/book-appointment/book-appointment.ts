import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { PatientService } from '../../../core/services/patient';
import { EmployeeService } from '../../../core/services/employee';
import { AppointmentService } from '../../../core/services/appointment';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-appointment.html',
  styleUrls: ['./book-appointment.css']
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
  slotErrorMessage = '';

  // Form related variables
  appointmentForm: any;
  selectedDoctor: any = null;
  minDate = '';
  patientSearch = '';
  doctorSearch = '';
  showPatientDropdown = false;
  showDoctorDropdown = false;

  get effectiveMinDate(): string {
    if (!this.selectedDoctor?.joiningDate) {
      return this.minDate;
    }

    const joiningDate = this.toDateInputValue(this.selectedDoctor.joiningDate);

    return joiningDate > this.minDate ? joiningDate : this.minDate;
  }

  get selectedDoctorAvailableFrom(): string {
    if (!this.selectedDoctor?.joiningDate) {
      return '';
    }

    return this.toDateInputValue(this.selectedDoctor.joiningDate);
  }

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

  get filteredPatientsForSearch(): any[] {
    const search = this.patientSearch.trim().toLowerCase();

    if (!search) {
      return this.patients;
    }

    return this.patients.filter((patient) =>
      `${patient.patientId} ${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(search)
    );
  }

  get filteredDoctorsForSearch(): any[] {
    const search = this.doctorSearch.trim().toLowerCase();

    if (!search) {
      return this.filteredDoctors;
    }

    return this.filteredDoctors.filter((doctor) =>
      `${doctor.name} ${doctor.department}`
        .toLowerCase()
        .includes(search)
    );
  }

  // Fetch all patients
  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response) => {

        this.patients = response.data;
        this.cdr.detectChanges();
      },

      error: (error) => {
      }
    });
  }

  // Fetch all doctors
  loadDoctors(): void {
    this.employeeService.getDoctors().subscribe({
      next: (response) => {

        this.doctors = response.data;

      },

      error: (error) => {
      }
    });
  }

  // Show doctors belonging to selected department
  filterDoctors(): void {
    const department =
      this.appointmentForm.get('department')?.value;


    this.filteredDoctors = this.doctors.filter(
      (doctor) => doctor.department === department
    );

    // Reset doctor and slot selection
    this.appointmentForm.get('doctorId')?.setValue('');
    this.doctorSearch = '';
    this.selectedDoctor = null;
    this.availableSlots = [];
    this.noSlotsError = false;
    this.slotErrorMessage = '';

    this.cdr.detectChanges();
  }

  onPatientSearchChange(value: string): void {
    this.patientSearch = value;
    this.showPatientDropdown = true;
    this.appointmentForm.get('patientId')?.setValue('');
  }

  selectPatient(patient: any): void {
    this.appointmentForm.get('patientId')?.setValue(patient._id);
    this.patientSearch = `${patient.patientId} - ${patient.firstName} ${patient.lastName}`;
    this.showPatientDropdown = false;
  }

  closePatientDropdown(): void {
    window.setTimeout(() => {
      this.showPatientDropdown = false;
      this.cdr.detectChanges();
    }, 150);
  }

  onDoctorSearchChange(value: string): void {
    this.doctorSearch = value;
    this.showDoctorDropdown = true;
    this.appointmentForm.get('doctorId')?.setValue('');
    this.selectedDoctor = null;
    this.availableSlots = [];
    this.noSlotsError = false;
    this.slotErrorMessage = '';
  }

  selectDoctor(doctor: any): void {
    this.appointmentForm.get('doctorId')?.setValue(doctor._id);
    this.doctorSearch = doctor.name;
    this.showDoctorDropdown = false;
    this.onDoctorChange();
  }

  closeDoctorDropdown(): void {
    window.setTimeout(() => {
      this.showDoctorDropdown = false;
      this.cdr.detectChanges();
    }, 150);
  }

  // Load available slots for selected doctor and date
  fetchAvailableSlots(): void {
    const doctorId =
      this.appointmentForm.get('doctorId')?.value;

    const appointmentDate =
      this.appointmentForm.get('appointmentDate')?.value;

    if (!doctorId || !appointmentDate) {
      return;
    }

    this.noSlotsError = false;
    this.slotErrorMessage = '';
    this.appointmentForm.get('appointmentTime')?.setValue('');

    // Prevent selecting past dates
    const selectedDate = new Date(appointmentDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.availableSlots = [];
      this.noSlotsError = true;
      this.slotErrorMessage = 'Cannot select past dates';

      this.toastService.show(
        this.slotErrorMessage,
        'error'
      );

      return;
    }

    if (this.selectedDoctor?.joiningDate) {
      const joiningDate = this.normalizeDate(this.selectedDoctor.joiningDate);

      if (selectedDate < joiningDate) {
        this.availableSlots = [];
        this.noSlotsError = true;
        this.slotErrorMessage = `Appointments can be booked only from doctor's joining date (${this.selectedDoctorAvailableFrom})`;

        this.toastService.show(this.slotErrorMessage, 'error');
        this.cdr.detectChanges();

        return;
      }
    }

    const year = Number.parseInt(
      appointmentDate.split('-')[0],
      10
    );

    if (year < 2000) {
      return;
    }

    this.appointmentService
      .getAvailableSlots(
        doctorId,
        appointmentDate
      )
      .subscribe({
        next: (response) => {

          let slots = response.data || [];

          const selectedDateObj =
            new Date(appointmentDate);

          const currentDate = new Date();

          const isToday =
            selectedDateObj.toDateString() ===
            currentDate.toDateString();

          // Hide already passed slots for today's bookings
          if (isToday) {
            const currentTime = new Date();

            // Keep 15 minute buffer
            currentTime.setMinutes(
              currentTime.getMinutes() + 15
            );

            slots = slots.filter(
              (slot: string) => {
                const [hours, minutes] = slot
                  .split(':')
                  .map(Number);

                const slotTime = new Date();

                slotTime.setHours(
                  hours,
                  minutes,
                  0,
                  0
                );

                return slotTime > currentTime;
              }
            );
          }

          this.availableSlots = slots;

          if (this.availableSlots.length === 0) {
            this.noSlotsError = true;
            this.slotErrorMessage = 'No slots available for the selected date.';

            this.toastService.show(
              this.slotErrorMessage,
              'error'
            );
          } else {
            this.noSlotsError = false;
            this.slotErrorMessage = '';
          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          this.availableSlots = [];
          this.noSlotsError = true;
          this.slotErrorMessage =
            getApiErrorMessage(error, 'No slots available for the selected date.');

          this.toastService.show(
            this.slotErrorMessage,
            'error'
          );

          this.cdr.detectChanges();
        }
      });
  }

  // Update selected doctor and refresh slots
  onDoctorChange(): void {
    const doctorId =
      this.appointmentForm.get('doctorId')?.value;


    this.selectedDoctor =
      this.filteredDoctors.find(
        (doctor: any) =>
          doctor._id === doctorId
      );

    // Reset slot selection when doctor changes
    this.appointmentForm
      .get('appointmentTime')
      ?.setValue('');

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

      if (
        this.appointmentForm.get('appointmentDate')
          ?.valid &&
        this.availableSlots.length === 0
      ) {
        this.noSlotsError = true;
        this.slotErrorMessage =
          this.slotErrorMessage || 'Select an available appointment slot';
      }

      return;
    }

    if (this.availableSlots.length === 0) {
      this.noSlotsError = true;
      this.slotErrorMessage =
        this.slotErrorMessage || 'Select an available appointment slot';

      this.cdr.detectChanges();

      return;
    }

    this.isSubmitting = true;

    // Convert symptoms text into array
    const formData = {
      ...this.appointmentForm.value,

      symptoms: this.appointmentForm.value.symptoms
        ? this.appointmentForm.value.symptoms
            .split(',')
            .map((symptom: string) =>
              symptom.trim()
            )
            .filter(Boolean)
        : []
    };


    this.appointmentService
      .bookAppointment(formData)
      .subscribe({
        next: (response) => {

          this.toastService.show(
            'Appointment booked successfully',
            'success'
          );

          // Reset form after successful booking
          this.appointmentForm.reset({
            appointmentType: 'CONSULTATION',
            priority: 'NORMAL',
            paymentStatus: 'PENDING',
            visitMode: 'OFFLINE',
            consultationFee: 0
          });

          this.availableSlots = [];
          this.slotErrorMessage = '';
          this.filteredDoctors = [];
          this.patientSearch = '';
          this.doctorSearch = '';
          this.selectedDoctor = null;
          this.isSubmitting = false;
        },

        error: (error) => {

          this.isSubmitting = false;

          this.toastService.show(
            getApiErrorMessage(error, 'Failed to book appointment.'),
            'error'
          );
        }
      });
  }

  private normalizeDate(value: string): Date {
    const date = new Date(value);

    date.setHours(0, 0, 0, 0);

    return date;
  }

  private toDateInputValue(value: string): string {
    return new Date(value).toISOString().split('T')[0];
  }
}
