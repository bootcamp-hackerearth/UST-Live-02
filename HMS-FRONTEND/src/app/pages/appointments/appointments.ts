import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { AppointmentService } from '../../services/appointments.service';
import { Appointment } from '../../models/appointments.model';
import { Patient } from '../../models/patients.model';
import { Doctor } from '../../models/doctor.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class Appointments implements OnInit {

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

  currentPage = 1;
  pageSize = 10;

  patients: Patient[] = [];
  doctors: Doctor[] = [];

  userRole = '';
  errorMessage = '';
  searchText = '';
  showAddAppointmentModal = false;

  todayDate = new Date().toISOString().split('T')[0];


  availableSlots: string[] = [];
  loadingSlots = false;
  doctorAvailability = '';
  bookedCount = 0;


  appointmentForm = new FormGroup({
    patientId: new FormControl('', [
      Validators.required
    ]),
    doctorId: new FormControl('', [
      Validators.required
    ]),
    appointmentDate: new FormControl('', [
      Validators.required,
      this.futureDateValidator
    ]),
    timeSlot: new FormControl('', [
      Validators.required
    ]),
    reason: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(500)
    ])
  });

  constructor(
    readonly appointmentService: AppointmentService,
    readonly cd: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    const role = localStorage.getItem('role');
    this.userRole = role || '';

    if (role === 'Doctor') {
      this.getMyAppointments();
    } else {
      this.getAppointments();
      this.getPatients();
      this.getDoctors();
      this.setupSlotWatcher();
    }
  }
  get canCreateAppointment(): boolean {
    return this.userRole !== 'Doctor';
  }



canCancelAppointment(appointment: any): boolean {
  return (
    appointment.status === 'BOOKED' &&
    this.userRole !== 'Doctor'
  );
}



  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const selectedDate = new Date(value);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }





  setupSlotWatcher() {
    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(() => {
      this.fetchAvailableSlots();
    });

    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.fetchAvailableSlots();
    });
  }





  fetchAvailableSlots() {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;


    this.appointmentForm.get('timeSlot')?.setValue('');

    if (doctorId && appointmentDate) {
      this.loadingSlots = true;

      this.appointmentService.getAvailableSlots(doctorId, appointmentDate)
        .subscribe({
          next: (res) => {
            this.availableSlots = res.data.availableSlots;
            this.bookedCount = res.data.bookedCount;
            this.doctorAvailability =
              `${res.data.availabilityStart} - ${res.data.availabilityEnd}`;
            this.loadingSlots = false;
            this.cd.detectChanges();
          },
          error: (err) => {
            console.error('Error fetching slots:', err);
            this.availableSlots = [];
            this.bookedCount = 0;
            this.doctorAvailability = '';
            this.loadingSlots = false;
            this.cd.detectChanges();
          }
        });
    } else {
      this.availableSlots = [];
      this.bookedCount = 0;
      this.doctorAvailability = '';
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }





  getMyAppointments() {
    this.appointmentService.getMyAppointments()
      .subscribe({
        next: (res) => {
          this.appointments = res.data;
          this.filteredAppointments = res.data;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching my appointments:', err);
        }
      });
  }






  getAppointments() {
    this.appointmentService.getAppointments()
      .subscribe({
        next: (res) => {
          this.appointments = res.data;
          this.filteredAppointments = res.data;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching appointments:', err);
        }
      });
  }





  getPatients() {
    this.appointmentService.getPatients()
      .subscribe({
        next: (res) => {
          this.patients = res.data;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching patients:', err);
        }
      });
  }





  getDoctors() {
    this.appointmentService.getDoctors()
      .subscribe({
        next: (res) => {
          this.doctors = res.data;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching doctors:', err);
        }
      });
  }

  get paginatedAppointments(): Appointment[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return this.filteredAppointments.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAppointments.length / this.pageSize);
  }

  get startRecord(): number {
    if (this.filteredAppointments.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredAppointments.length
    );
  }





  filterAppointments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.filteredAppointments = [...this.appointments];
      this.currentPage = 1;
      return;
    }

    this.filteredAppointments = this.appointments.filter(appointment =>
      appointment.appointmentCode?.toLowerCase().includes(search) ||
      appointment.patientId?.firstName?.toLowerCase().includes(search) ||
      appointment.patientId?.lastName?.toLowerCase().includes(search) ||
      appointment.patientId?.UHID?.toLowerCase().includes(search) ||

      appointment.doctorId?.employeeId?.userId?.firstName?.toLowerCase().includes(search) ||
      appointment.doctorId?.employeeId?.userId?.lastName?.toLowerCase().includes(search) ||
      appointment.doctorId?.employeeId?.department?.toLowerCase().includes(search) ||
      appointment.timeSlot?.toLowerCase().includes(search) ||
      appointment.status?.toLowerCase().includes(search) ||
      appointment.reason?.toLowerCase().includes(search)
    );
    this.currentPage = 1;
  }





  openAddAppointmentModal() {
    this.appointmentForm.reset();
    this.availableSlots = [];
    this.bookedCount = 0;
    this.doctorAvailability = '';
    this.errorMessage = '';
    this.showAddAppointmentModal = true;
  }

  closeAddAppointmentModal() {
    this.showAddAppointmentModal = false;
    this.appointmentForm.reset();
    this.availableSlots = [];
    this.bookedCount = 0;
    this.errorMessage = '';
    this.doctorAvailability = '';
  }



  saveAppointment() {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    const payload = this.appointmentForm.value;

    this.appointmentService.createAppointment(payload as any)
      .subscribe({
        next: (res) => {
          this.errorMessage = '';
          alert('Appointment created successfully!');
          this.closeAddAppointmentModal();
          this.getAppointments();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Appointment creation failed doctor not joined yet';
          this.cd.detectChanges();
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
      this.getAppointments();
    },
    error: (error) => {
      console.log('Cancel appointment error:', error);
      alert(error.error?.message || 'Unable to cancel appointment');
    }
  });
}
}


