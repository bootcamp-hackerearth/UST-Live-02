import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TokenService } from '../../../core/services/token';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-create-password',
  imports: [ReactiveFormsModule],
  templateUrl: './create-password.html',
  styleUrl: './create-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePassword {
  passwordForm: FormGroup;
  isSubmitting = false;

  securityQuestions = [
    'What is your favourite color?',
    'What is your pet name?',
    'What is your birth city?',
    'What is your favourite food?',
    'What is your school name?'
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService
  ) {
    this.passwordForm = this.fb.group({
      temporaryPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        ]
      ],
      confirmPassword: ['', Validators.required],
      securityQuestion: ['', Validators.required],
      securityAnswer: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }

  // Create password on first login
  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const payload = {
      loginId: localStorage.getItem('loginId'),
      temporaryPassword: this.passwordForm.value.temporaryPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
      securityQuestion: this.passwordForm.value.securityQuestion,
      securityAnswer: this.passwordForm.value.securityAnswer
    };

    this.authService.createPassword(payload).subscribe({
      next: (response) => {
        console.log(response);

        this.toast.success('Password created successfully');
        this.tokenService.removeTokens();
        this.router.navigate(['/login']);
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.log(error);
        console.log(error.error.errors);
        this.toast.error(error?.error?.message || 'Unable to create password');
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
