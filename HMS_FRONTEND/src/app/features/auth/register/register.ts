import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  registerForm: FormGroup;

  readonly isSubmitting = signal(false);
  readonly currentStep = signal(1);

  securityQuestions = [
    'What is your favourite color?',
    'What is your pet name?',
    'What is your birth city?',
    'What is your favourite food?',
    'What is your school name?'
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      // Basic details
      name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern('^[A-Za-z ]+$')]
      ],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      countryCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      joiningDate: ['', Validators.required],
      // Doctor specific fields
      qualification: [''],
      specialization: [''],
      medicalRegistrationNo: [''],
      consultationFee: [''],
      // Security details
      securityQuestion: ['', Validators.required],
      securityAnswer: ['', Validators.required],
      // Password fields
      password: [
        '',
        [Validators.required, Validators.pattern(String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$`)]
      ],
      confirmPassword: ['', Validators.required]
    });

    // Apply doctor validations dynamically
    this.registerForm.get('designation')?.valueChanges.subscribe((designation) => {
      const doctorFields = ['qualification', 'specialization', 'medicalRegistrationNo'];

      if (designation === 'DOCTOR') {
        doctorFields.forEach((field) => {
          this.registerForm.get(field)?.setValidators([Validators.required]);
          this.registerForm.get(field)?.updateValueAndValidity();
        });
      } else {
        doctorFields.forEach((field) => {
          this.registerForm.get(field)?.clearValidators();
          this.registerForm.get(field)?.setValue('');
          this.registerForm.get(field)?.updateValueAndValidity();
        });
      }
    });
  }

  // Check if selected designation is doctor
  isDoctor(): boolean {
    return this.registerForm.get('designation')?.value === 'DOCTOR';
  }

  // Go to previous step
  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  // Move to next step after validation
  nextStep(): void {
    if (this.currentStep() === 1) {
      const step1Fields = [
        'name',
        'email',
        'gender',
        'countryCode',
        'phone',
        'department',
        'designation',
        'joiningDate'
      ];

      step1Fields.forEach((field) => {
        this.registerForm.get(field)?.markAsTouched();
      });

      const isInvalid = step1Fields.some((field) => this.registerForm.get(field)?.invalid);

      if (isInvalid) {
        return;
      }
    }

    if (this.currentStep() === 2 && this.isDoctor()) {
      const doctorFields = ['specialization', 'qualification', 'medicalRegistrationNo'];

      doctorFields.forEach((field) => {
        this.registerForm.get(field)?.markAsTouched();
      });

      const isInvalid = doctorFields.some((field) => this.registerForm.get(field)?.invalid);

      if (isInvalid) {
        return;
      }
    }

    this.currentStep.update(s => s + 1);
  }

  // Submit registration form
  onSubmit(): void {
    console.log('REGISTER BUTTON CLICKED');
    console.log('FORM VALID', this.registerForm.valid);
    console.log('Designation Value:', this.registerForm.get('designation')?.value);
    console.log('Consultation Fee Errors:', this.registerForm.get('consultationFee')?.errors);
    console.log('Consultation Fee Valid:', this.registerForm.get('consultationFee')?.valid);

    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);

      if (control?.invalid) {
        console.log(key, control.errors);
      }
    });

    const step3Fields = ['password', 'confirmPassword', 'securityQuestion', 'securityAnswer'];

    step3Fields.forEach((field) => {
      this.registerForm.get(field)?.markAsTouched();
    });

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.toastService.show('Passwords do not match', 'error');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      ...this.registerForm.value
    };

    this.authService.register(payload).subscribe({
      next: (response: any) => {
        console.log(response);

        this.isSubmitting.set(false);

        this.toastService.show('Registration submitted successfully. Wait for admin approval.', 'success');

        this.registerForm.reset();

        this.registerForm.patchValue({
          countryCode: '+91'
        });

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (error) => {
        this.toastService.show(error?.error?.message || 'Registration failed', 'error');

        this.isSubmitting.set(false);
      }
    });
  }
}
