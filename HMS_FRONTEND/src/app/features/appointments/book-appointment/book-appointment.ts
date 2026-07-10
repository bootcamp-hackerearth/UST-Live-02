import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
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
  readonly patients = signal<any[]>([]);
  readonly doctors = signal<any[]>([]);
  readonly filteredDoctors = signal<any[]>([]);
  readonly availableSlots = signal<string[]>([]);

  readonly isSubmitting = signal(false);
  readonly noSlotsError = signal(false);
  readonly selectedDoctor = signal<any>(null);

  appointmentForm: any;
  readonly minDate: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly patientService: PatientService,
    private readonly employeeService: EmployeeService,
    private readonly appointmentService: AppointmentService,
    private readonly toastService: ToastService
  ) {
    this.minDate = new Date().toISOString().split('T')[0];

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
    this.loadPatients();
    this.loadDoctors();

    this.appointmentForm.get('department')?.valueChanges.subscribe(() => {
      this.filterDoctors();
    });

    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.filterDoctors();
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response) => {
        console.log(response);
        this.patients.set(response.data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  loadDoctors(): void {
    this.employeeService.getDoctors().subscribe({
      next: (response) => {
        console.log(response);
        this.doctors.set(response.data);
        console.log('Doctors Array:', this.doctors());

        if (this.appointmentForm.get('department')?.value) {
          this.filterDoctors();
        }
      },
      error: (error) => {
        console.log(error);
        this.doctors.set([]);
        this.filteredDoctors.set([]);
      }
    });
  }

  filterDoctors(): void {
    const department = this.appointmentForm.get('department')?.value;
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    if (!department) {
      this.filteredDoctors.set([]);
      this.appointmentForm.get('doctorId')?.setValue('');
      this.selectedDoctor.set(null);
      this.availableSlots.set([]);
      this.noSlotsError.set(false);
      return;
    }

    let filtered = this.doctors().filter((doctor) => doctor.department === department);

    if (appointmentDate) {
      const selectedDate = new Date(appointmentDate);
      selectedDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((doctor) => {
        if (!doctor.joiningDate) return true;
        const joiningDate = new Date(doctor.joiningDate);
        joiningDate.setHours(0, 0, 0, 0);
        return joiningDate <= selectedDate;
      });
    }

    this.filteredDoctors.set(filtered);
    this.appointmentForm.get('doctorId')?.setValue('');
    this.selectedDoctor.set(null);
    this.availableSlots.set([]);
    this.noSlotsError.set(false);
  }

  fetchAvailableSlots(): void {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    if (!doctorId || !appointmentDate) {
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.availableSlots.set([]);
      this.noSlotsError.set(true);
      this.toastService.show('Cannot select past dates', 'error');
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

        if (isToday) {
          const currentTime = new Date();
          currentTime.setMinutes(currentTime.getMinutes() + 15);

          slots = slots.filter((slot: string) => {
            const [hours, minutes] = slot.split(':').map(Number);
            const slotTime = new Date();
            slotTime.setHours(hours, minutes, 0, 0);
            return slotTime > currentTime;
          });
        }

        this.availableSlots.set(slots);

        if (this.availableSlots().length === 0) {
          this.noSlotsError.set(true);
          this.toastService.show('No slots available for the selected date.', 'error');
        } else {
          this.noSlotsError.set(false);
        }
      },
      error: (error) => {
        console.log('Slots error:', error);
        this.availableSlots.set([]);
        this.noSlotsError.set(true);
        this.toastService.show(error?.error?.message || 'No slots available for the selected date.', 'error');
      }
    });
  }

  onDoctorChange(): void {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    console.log(this.selectedDoctor());

    this.selectedDoctor.set(this.filteredDoctors().find((doctor: any) => doctor._id === doctorId));

    this.appointmentForm.get('appointmentTime')?.setValue('');
    this.availableSlots.set([]);
    this.noSlotsError.set(false);

    this.fetchAvailableSlots();
    console.log(this.selectedDoctor());
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();

      if (this.appointmentForm.get('appointmentDate')?.valid && this.availableSlots().length === 0) {
        this.noSlotsError.set(true);
      }

      return;
    }

    if (this.availableSlots().length === 0) {
      this.noSlotsError.set(true);
      return;
    }

    this.isSubmitting.set(true);

    const formData = {
      ...this.appointmentForm.value,
      symptoms: this.appointmentForm.value.symptoms?.split(',').map((symptom: string) => symptom.trim())
    };

    console.log(formData);

    this.appointmentService.bookAppointment(formData).subscribe({
      next: (response) => {
        console.log(response);

        this.toastService.show('Appointment booked successfully', 'success');

        this.appointmentForm.reset({
          appointmentType: 'CONSULTATION',
          priority: 'NORMAL',
          paymentStatus: 'PENDING',
          visitMode: 'OFFLINE',
          consultationFee: 0
        });

        this.availableSlots.set([]);
        this.filteredDoctors.set([]);
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.log(error);
        this.isSubmitting.set(false);
        this.toastService.show(error?.error?.message || 'Failed to book appointment.', 'error');
      }
    });
  }
}
