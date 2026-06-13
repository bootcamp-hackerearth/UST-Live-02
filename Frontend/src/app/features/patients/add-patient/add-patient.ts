import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { ToastService } from '../../../core/services/toast';
import { PatientService } from '../../../core/services/patient';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-patient.html',
  styleUrls: ['./add-patient.css']
})
export class AddPatient {
  currentStep = 1;
  isSubmitting = false;
  maxDate = new Date().toISOString().split('T')[0];

  patientForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService,
    private readonly patientService: PatientService
  ) {
    this.patientForm = this.fb.group({
      // Basic Information
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
      dateOfBirth: [
        '',
        [
          Validators.required,
          this.notFutureDateValidator
        ]
      ],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      maritalStatus: ['', Validators.required],

      // Contact Information
      countryCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', Validators.required],
      address: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]
      ],
      city: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]
      ],
      state: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]
      ],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      country: ['India'],

      // Emergency Contact
      emergencyContactName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]
      ],
      emergencyContactPhone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/)
        ]
      ],

      // Medical Information
      medicalHistory: [''],
      allergies: [''],
      chronicDiseases: [''],
      currentMedications: [''],
      pastSurgeries: [''],
      familyMedicalHistory: [''],

      // Insurance Information
      insuranceProvider: [''],
      insurancePolicyNumber: [''],
      insuranceExpiryDate: [''],
      insuranceCoverageAmount: [''],

      // Hospital Information
      department: [''],
      patientType: ['', Validators.required]
    });
  }

  notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? { futureDate: true } : null;
  }

  // Move to next step after validating current step
  nextStep(): void {
    const stepFields: { [key: number]: string[] } = {
      1: [
        'firstName',
        'lastName',
        'dateOfBirth',
        'gender',
        'bloodGroup',
        'maritalStatus'
      ],
      2: [
        'phone',
        'email',
        'address',
        'city',
        'state',
        'pincode',
        'emergencyContactName',
        'emergencyContactPhone'
      ],
      3: [],
      4: ['patientType']
    };

    const fieldsToValidate = stepFields[this.currentStep] || [];

    fieldsToValidate.forEach((field) => {
      this.patientForm.get(field)?.markAsTouched();
    });

    const isStepValid = fieldsToValidate.every(
      (field) => this.patientForm.get(field)?.valid
    );

    if (!isStepValid) {
      return;
    }

    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  // Go back to previous step
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Register patient
  onSubmit(): void {
    console.log('Register Patient Clicked');
    console.log(this.patientForm.value);

    this.patientForm.get('patientType')?.markAsTouched();

    if (this.patientForm.get('patientType')?.invalid) {
      return;
    }

    if (this.patientForm.invalid) {
      console.log('FORM INVALID');

      Object.keys(this.patientForm.controls).forEach((key) => {
        const control = this.patientForm.get(key);

        if (control?.invalid) {
          console.log(key, control.errors);
        }
      });

      this.patientForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.patientService.createPatient(this.patientForm.value).subscribe({
      next: (response) => {
        console.log(response);

        this.toastService.show(
          'Patient Registered Successfully',
          'success'
        );

        // Reset form
        this.patientForm.reset();

        // Restore default values
        this.patientForm.patchValue({
          countryCode: '+91',
          country: 'India',
          patientType: ''
        });

        // Reset UI state
        this.currentStep = 1;
        this.isSubmitting = false;
      },

      error: (error) => {
        console.log('FULL ERROR =>', error);
        console.log('ERROR BODY =>', error?.error);
        console.log('VALIDATION ERRORS =>', error?.error?.errors);
        console.log(
          'VALIDATION ERRORS JSON =>',
          JSON.stringify(error?.error?.errors, null, 2)
        );

        const validationMessage = error?.error?.errors
          ?.map((validationError: any) => {
            const field = validationError.path || validationError.param;

            return field
              ? `${field}: ${validationError.msg}`
              : validationError.msg;
          })
          .join('\n');

        const message =
          validationMessage ||
          error?.error?.message ||
          'Failed to register patient';

        alert(message);
        // alert(
        //   JSON.stringify(
        //     error?.error?.errors,
        //     null,
        //     2
        //   )
        // );

        this.isSubmitting = false;
      }
    });
  }
}
