import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { ToastService } from '../../../core/services/toast';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private readonly toastService: ToastService,
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
      diagnosis: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]],
      symptoms: ['', Validators.maxLength(1000)],
      doctorNotes: ['', Validators.maxLength(2000)],

      vitals: this.fb.group({
        bloodPressure: ['', Validators.pattern(/^\d{2,3}\/\d{2,3}$/)],
        pulseRate: ['', [Validators.min(20), Validators.max(250)]],
        oxygenLevel: ['', [Validators.min(0), Validators.max(100)]],
        temperature: ['', [Validators.min(30), Validators.max(45)]],
        weight: ['', [Validators.min(0.5), Validators.max(500)]]
      }),

      prescriptions: this.fb.array([
        this.createPrescription()
      ])
    });
  }

  // Create prescription form group
  createPrescription(): FormGroup {
    return this.fb.group({
      medicineName: ['', [Validators.required, Validators.maxLength(100)]],
      dosage: ['', [Validators.required, Validators.maxLength(100)]],
      frequency: ['', [Validators.required, Validators.maxLength(100)]],
      duration: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  // Get prescriptions form array
  get prescriptions(): FormArray {
    return this.consultationForm.get('prescriptions') as FormArray;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.consultationForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.touched || field.dirty)
    );
  }

  isVitalFieldInvalid(fieldName: string): boolean {
    const field = this.consultationForm.get(`vitals.${fieldName}`);

    return !!(
      field &&
      field.invalid &&
      (field.touched || field.dirty)
    );
  }

  isPrescriptionFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.prescriptions.at(index).get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.touched || field.dirty)
    );
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

        this.appointment = response.data;
      },

      error: (error) => {
      }
    });
  }

  // Submit consultation
  onSubmit(): void {
    if (this.consultationForm.invalid) {
      this.consultationForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;

    const consultationData = {
      appointmentId: this.appointment?._id,
      patientId: this.appointment?.patientId?._id,

      diagnosis: this.consultationForm.value.diagnosis,

      symptoms: this.consultationForm.value.symptoms
        ?.split(',')
        .map((symptom: string) => symptom.trim()),

      doctorNotes: this.consultationForm.value.doctorNotes,

      vitals: this.consultationForm.value.vitals,

      prescriptions: this.consultationForm.value.prescriptions
    };


    this.consultationService.createConsultation(consultationData).subscribe({
      next: (response) => {

        alert('Consultation completed successfully');

        this.isSubmitting = false;

        this.router.navigate([
          '/consultations',
          response.data._id
        ]);
      },

      error: (error) => {

        this.isSubmitting = false;
        this.toastService.show(
          getApiErrorMessage(error, 'Failed to complete consultation'),
          'error'
        );
      }
    });
  }
}
