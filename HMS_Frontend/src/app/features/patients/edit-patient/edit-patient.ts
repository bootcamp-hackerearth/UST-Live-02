import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PatientService } from '../../../core/services/patient';

@Component({
  selector: 'app-edit-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-patient.html',
  styleUrls: ['./edit-patient.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    private readonly patientService: PatientService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: [''],
      bloodGroup: [''],
      phone: [''],
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
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.log(error);
        this.cdr.markForCheck();
      }
    });
  }

  // Load patient details
  loadPatient(): void {
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (response) => {
        console.log(response);

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

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.log(error);
        this.cdr.markForCheck();
      }
    });
  }

  // Update patient
  onSubmit(): void {
    if (this.patientForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.patientService.updatePatient(this.patientId, this.patientForm.value).subscribe({
      next: (response) => {
        console.log(response);

        alert('Patient Updated Successfully');

        this.isSubmitting = false;
        this.cdr.markForCheck();

        this.router.navigate(['/patients']);
      },

      error: (error) => {
        console.log(error);

        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
