import { Component, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';

import {
  appointmentValidators
} from '../../validations/appointment.validation';
import { AppointmentService } from '../../services/appointments.service';
import { Appointment } from '../../models/appointments.model';
import { Patient } from '../../models/patients.model';
import { Doctor } from '../../models/doctor.model';

@Component({
  selector: 'app-appointments',

  imports: [ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class Appointments implements OnInit {
  appointments = signal<Appointment[]>([]);
  filteredAppointments = signal<Appointment[]>([]);

  searchText = signal('');

  currentPage = signal(1);
  pageSize = 10;
  totalRecords = signal(0);
  totalPages = signal(0);

  patients = signal<Patient[]>([]);
  doctors = signal<Doctor[]>([]);

  patientSearch = signal('');
  doctorSearch = signal('');

  filteredPatients = signal<Patient[]>([]);
  filteredDoctors = signal<Doctor[]>([]);

  showPatientSuggestions = signal(false);
  showDoctorSuggestions = signal(false);

  allSlots = signal<string[]>([]);
  availableSlots = signal<string[]>([]);
  bookedSlots = signal<string[]>([]);

  userRole = signal('');
  errorMessage = signal('');
  showAddAppointmentModal = signal(false);

  todayDate = new Date().toISOString().split('T')[0];

  loadingSlots = signal(false);
  doctorAvailability = signal('');
  bookedCount = signal(0);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  appointmentForm = new FormGroup({
    patientId: new FormControl(
      '',
      appointmentValidators.patientId
    ),

    doctorId: new FormControl(
      '',
      appointmentValidators.doctorId
    ),

    appointmentDate: new FormControl(
      '',
      appointmentValidators.appointmentDate
    ),

    timeSlot: new FormControl(
      '',
      appointmentValidators.timeSlot
    ),

    reason: new FormControl(
      '',
      appointmentValidators.reason
    )
  });

  constructor(
    readonly appointmentService: AppointmentService,
    readonly router: Router
  ) {}

  ngOnInit(): void {
    const role = localStorage.getItem('role') || '';
    this.userRole.set(role);

    if (role === 'Doctor') {
      this.getMyAppointments();
      return;
    }

    this.getAppointments();
    this.getPatients();
    this.getDoctors();
    this.setupSlotWatcher();
  }

  get canCreateAppointment(): boolean {
    return this.userRole() !== 'Doctor';
  }

  viewDetails(appointmentId: string): void {
    const basePath = localStorage.getItem('basePath') || '/admin';
    this.router.navigate([`${basePath}/appointments/details`, appointmentId]);
  }

  canCancelAppointment(appointment: Appointment): boolean {
    return (
      appointment.status === 'BOOKED' &&
      this.userRole() !== 'Doctor'
    );
  }

  setupSlotWatcher(): void {
    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(() => {
      this.fetchAvailableSlots();
    });

    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.fetchAvailableSlots();
    });
  }

  fetchAvailableSlots(): void {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    this.appointmentForm.get('timeSlot')?.setValue('');

    if (!doctorId || !appointmentDate) {
      this.clearSlotData();
      return;
    }

    this.loadingSlots.set(true);

    this.appointmentService.getAvailableSlots(doctorId, appointmentDate)
      .subscribe({
        next: (res) => {
          this.allSlots.set(res.data.allSlots || res.data.availableSlots || []);
          this.availableSlots.set(res.data.availableSlots || []);
          this.bookedSlots.set(res.data.bookedSlots || []);
          this.bookedCount.set(res.data.bookedCount || 0);

          this.doctorAvailability.set(
            `${res.data.availabilityStart} - ${res.data.availabilityEnd}`
          );

          this.loadingSlots.set(false);
        },
        error: (err) => {
          console.error('Error fetching slots:', err);
          this.clearSlotData();
          this.loadingSlots.set(false);
        }
      });
  }

  clearSlotData(): void {
    this.allSlots.set([]);
    this.availableSlots.set([]);
    this.bookedSlots.set([]);
    this.bookedCount.set(0);
    this.doctorAvailability.set('');
  }

  getAppointments(): void {
    this.appointmentService
      .getAppointments(
        this.currentPage(),
        this.pageSize,
        this.searchText().trim()
      )
      .subscribe({
        next: (res) => {
          this.appointments.set(res.data);
          this.filteredAppointments.set(res.data);

          this.totalRecords.set(res.pagination.totalRecords);
          this.totalPages.set(res.pagination.totalPages);
          this.currentPage.set(res.pagination.page);
        },
        error: (err) => {
          console.error('Error fetching appointments:', err);
        }
      });
  }
getMyAppointments(): void {
  this.appointmentService
    .getMyAppointments(
      this.currentPage(),
      this.pageSize,
      this.searchText().trim()
    )
    .subscribe({
      next: (res) => {
        this.appointments.set(res.data);
        this.filteredAppointments.set(res.data);

        this.totalRecords.set(res.pagination.totalRecords);
        this.totalPages.set(res.pagination.totalPages);
        this.currentPage.set(res.pagination.page);
      },
      error: (err) => {
        console.error('Error fetching my appointments:', err);
      }
    });
}
  getPatients(): void {
    this.appointmentService.getPatients()
      .subscribe({
        next: (res) => {
          this.patients.set(res.data);
        },
        error: (err) => {
          console.error('Error fetching patients:', err);
        }
      });
  }

  getDoctors(): void {
    this.appointmentService.getDoctors()
      .subscribe({
        next: (res) => {
          this.doctors.set(res.data);
        },
        error: (err) => {
          console.error('Error fetching doctors:', err);
        }
      });
  }

get paginatedAppointments(): Appointment[] {
  return this.appointments();
}

  get startRecord(): number {
    if (this.totalRecords() === 0) {
      return 0;
    }

    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    const end = this.currentPage() * this.pageSize;
    return Math.min(end, this.totalRecords());
  }

goToPreviousPage(): void {
  if (this.currentPage() > 1) {
    this.currentPage.update(page => page - 1);

    if (this.userRole() === 'Doctor') {
      this.getMyAppointments();
      return;
    }

    this.getAppointments();
  }
}
goToNextPage(): void {
  if (this.currentPage() < this.totalPages()) {
    this.currentPage.update(page => page + 1);

    if (this.userRole() === 'Doctor') {
      this.getMyAppointments();
      return;
    }

    this.getAppointments();
  }
}
filterAppointments(): void {
  if (this.searchTimer) {
    clearTimeout(this.searchTimer);
  }

  this.searchTimer = setTimeout(() => {
    this.currentPage.set(1);

    if (this.userRole() === 'Doctor') {
      this.getMyAppointments();
      return;
    }

    this.getAppointments();
  }, 300);
}

  showPatientDropdown(): void {
    this.filteredPatients.set([...this.patients()].slice(0, 6));
    this.showPatientSuggestions.set(true);
  }

  filterPatients(): void {
    const search = this.patientSearch().toLowerCase().trim();

    this.appointmentForm.patchValue({
      patientId: ''
    });

    if (!search) {
      this.filteredPatients.set([...this.patients()].slice(0, 6));
      this.showPatientSuggestions.set(true);
      return;
    }

    const filtered = this.patients()
      .filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(search) ||
        patient.UHID?.toLowerCase().includes(search)
      )
      .slice(0, 6);

    this.filteredPatients.set(filtered);
    this.showPatientSuggestions.set(true);
  }

  selectPatient(patient: Patient): void {
    this.patientSearch.set(
      `${patient.firstName} ${patient.lastName} - ${patient.UHID}`
    );

    this.appointmentForm.patchValue({
      patientId: patient.patientId
    });

    this.showPatientSuggestions.set(false);
  }

  showDoctorDropdown(): void {
    this.filteredDoctors.set([...this.doctors()].slice(0, 6));
    this.showDoctorSuggestions.set(true);
  }

  filterDoctorsSearch(): void {
    const search = this.doctorSearch().toLowerCase().trim();

    this.appointmentForm.patchValue({
      doctorId: '',
      timeSlot: ''
    });

    this.clearSlotData();

    if (!search) {
      this.filteredDoctors.set([...this.doctors()].slice(0, 6));
      this.showDoctorSuggestions.set(true);
      return;
    }

    const filtered = this.doctors()
      .filter(doctor =>
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(search) ||
        doctor.specialization?.toLowerCase().includes(search)
      )
      .slice(0, 6);

    this.filteredDoctors.set(filtered);
    this.showDoctorSuggestions.set(true);
  }

  selectDoctor(doctor: Doctor): void {
    this.doctorSearch.set(
      `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`
    );

    this.appointmentForm.patchValue({
      doctorId: doctor.employeeId,
      timeSlot: ''
    });

    this.showDoctorSuggestions.set(false);
  }

  selectSlot(slot: string): void {
    if (this.isBookedSlot(slot)) {
      return;
    }

    this.appointmentForm.patchValue({
      timeSlot: slot
    });
  }

  isBookedSlot(slot: string): boolean {
    return this.bookedSlots().includes(slot);
  }

  isSelectedSlot(slot: string): boolean {
    return this.appointmentForm.get('timeSlot')?.value === slot;
  }

  openAddAppointmentModal(): void {
    this.appointmentForm.reset();

    this.patientSearch.set('');
    this.doctorSearch.set('');

    this.filteredPatients.set([]);
    this.filteredDoctors.set([]);

    this.showPatientSuggestions.set(false);
    this.showDoctorSuggestions.set(false);

    this.clearSlotData();

    this.errorMessage.set('');
    this.showAddAppointmentModal.set(true);
  }

  closeAddAppointmentModal(): void {
    this.showAddAppointmentModal.set(false);

    this.appointmentForm.reset();

    this.patientSearch.set('');
    this.doctorSearch.set('');

    this.filteredPatients.set([]);
    this.filteredDoctors.set([]);

    this.showPatientSuggestions.set(false);
    this.showDoctorSuggestions.set(false);

    this.clearSlotData();

    this.errorMessage.set('');
  }

  saveAppointment(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    const payload = this.appointmentForm.value;

    this.appointmentService.createAppointment(payload as any)
      .subscribe({
        next: () => {
          this.errorMessage.set('');
          alert('Appointment created successfully!');
          this.closeAddAppointmentModal();

          this.currentPage.set(1);
          this.searchText.set('');

          if (this.userRole() === 'Doctor') {
            this.getMyAppointments();
          } else {
            this.getAppointments();
          }
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Appointment creation failed doctor not joined yet'
          );
        }
      });
  }

  cancelAppointment(appointmentId: string): void {
    const confirmed = confirm('Are you sure you want to cancel this appointment?');

    if (!confirmed) {
      return;
    }

    this.appointmentService.cancelAppointment(appointmentId).subscribe({
      next: (response: any) => {
        alert(response.message || 'Appointment cancelled successfully');

        if (this.userRole() === 'Doctor') {
          this.getMyAppointments();
        } else {
          this.getAppointments();
        }
      },
      error: (error) => {
        console.log('Cancel appointment error:', error);
        alert(error.error?.message || 'Unable to cancel appointment');
      }
    });
  }
}