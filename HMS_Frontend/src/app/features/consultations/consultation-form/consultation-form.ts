import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConsultationService } from '../../../core/services/consultation';
import { AppointmentService } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consultation-form.html',
  styleUrls: ['./consultation-form.css']
})
export class ConsultationForm implements OnInit {
  consultationForm!: FormGroup;

  appointment: any;

  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly consultationService: ConsultationService,
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Initialize form and load appointment
  ngOnInit(): void {
    this.initializeForm();

    const appointmentId = this.route.snapshot.paramMap.get('appointmentId');

    if (appointmentId) {
      this.loadAppointment(appointmentId);
    }
  }

  // Create consultation form
  initializeForm(): void {
    this.consultationForm = this.fb.group({
      diagnosis: ['', Validators.required],
      symptoms: [''],
      doctorNotes: [''],

      vitals: this.fb.group({
        bloodPressure: [''],
        pulseRate: [''],
        oxygenLevel: [''],
        temperature: [''],
        weight: ['']
      }),

      prescriptions: this.fb.array([
        this.createPrescription()
      ])
    });
  }

  // Create prescription form group
  createPrescription(): FormGroup {
    return this.fb.group({
      medicineName: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: ['', Validators.required]
    });
  }

  // Get prescriptions form array
  get prescriptions(): FormArray {
    return this.consultationForm.get('prescriptions') as FormArray;
  }

  // Add new prescription row
  addPrescription(): void {
    this.prescriptions.push(this.createPrescription());
  }

  // Remove prescription row
  removePrescription(index: number): void {
    this.prescriptions.removeAt(index);
  }

  // Load appointment details
  loadAppointment(id: string): void {
    this.appointmentService.getAppointmentById(id).subscribe({
      next: (response) => {
        console.log(response);

        this.appointment = response.data;
      },

      error: (error) => {
        console.log(error);
      }
    });
  }

  // Submit consultation
  onSubmit(): void {
    if (this.consultationForm.invalid) {
      this.consultationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const currentUser = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    const consultationData = {
      appointmentId: this.appointment?._id,
      patientId: this.appointment?.patientId?._id,
      doctorEmployeeId: currentUser?.employeeId?._id,

      diagnosis: this.consultationForm.value.diagnosis,

      symptoms: this.consultationForm.value.symptoms
        ?.split(',')
        .map((symptom: string) => symptom.trim()),

      doctorNotes: this.consultationForm.value.doctorNotes,

      vitals: this.consultationForm.value.vitals,

      prescriptions: this.consultationForm.value.prescriptions
    };

    console.log(consultationData);

    this.consultationService.createConsultation(consultationData).subscribe({
      next: (response) => {
        console.log(response);

        alert('Consultation completed successfully');

        this.isSubmitting = false;

        this.router.navigate([
          '/consultations',
          response.data._id
        ]);
      },

      error: (error) => {
        console.log(error);

        this.isSubmitting = false;
      }
    });
  }
}