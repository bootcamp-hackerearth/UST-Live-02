import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PatientService } from '../../../core/services/patient';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-edit-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-patient.html',
  styleUrls: ['./edit-patient.css']
})
export class EditPatient implements OnInit {
  patientId = '';
  isSubmitting = false;

  doctors: any[] = [];
  patientForm: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly patientService: PatientService
  ) {
    this.patientForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]
      ],
      gender: [''],
      bloodGroup: [''],
      phone: ['', Validators.pattern(/^\d{10}$/)],
      email: [''],
      medicalHistory: [''],
      allergies: [''],
      insuranceProvider: [''],
      patientType: [''],
      assignedDoctor: ['']
    });
  }

  // Load data on page load
  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id')!;

    this.loadDoctors();
    this.loadPatient();
  }

  // Load doctors for dropdown
  loadDoctors(): void {
    this.patientService.getDoctors().subscribe({
      next: (response) => {
        this.doctors = response.data;
      },

      error: (error) => {
      }
    });
  }

  // Load patient details
  loadPatient(): void {
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (response) => {

        const patient = response.data;

        this.patientForm.patchValue({
          firstName: patient.firstName,
          lastName: patient.lastName,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
          phone: patient.phone,
          email: patient.email,
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          insuranceProvider: patient.insuranceProvider,
          patientType: patient.patientType,
          assignedDoctor: patient?.assignedDoctor?._id
        });
      },

      error: (error) => {
      }
    });
  }

  // Update patient
  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.patientService.updatePatient(
      this.patientId,
      this.patientForm.value
    ).subscribe({
      next: (response) => {

        alert('Patient Updated Successfully');

        this.isSubmitting = false;

        this.router.navigate(['/patients']);
      },

      error: (error) => {

        this.isSubmitting = false;
      }
    });
  }
}
