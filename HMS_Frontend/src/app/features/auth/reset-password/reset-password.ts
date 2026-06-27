import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPassword implements OnInit {
  isSubmitting = false;

  email = '';
  securityQuestion = '';

  resetForm: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.resetForm = this.fb.group({
      securityAnswer: ['', Validators.required],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        ]
      ],

      confirmPassword: ['', Validators.required]
    });
  }

  // Load email and security question from navigation state
  ngOnInit(): void {
    const navigation = history.state;
    let recoveryState: any = {};

    try {
      const savedRecovery = sessionStorage.getItem('passwordRecovery');
      recoveryState = savedRecovery ? JSON.parse(savedRecovery) : {};
    } catch {
      sessionStorage.removeItem('passwordRecovery');
    }

    this.email = navigation?.email || recoveryState?.email || '';
    this.securityQuestion = navigation?.securityQuestion || recoveryState?.securityQuestion || '';

    // Redirect if page is opened directly
    if (!this.email || !this.securityQuestion) {
      this.router.navigate(['/forgot-password']);
    }

    this.cdr.markForCheck();
  }

  // Reset password
  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    if (this.resetForm.value.newPassword !== this.resetForm.value.confirmPassword) {
      this.isSubmitting = false;

      alert('Passwords do not match');
      this.cdr.markForCheck();
      return;
    }

    const payload = {
      email: this.email,
      securityAnswer: this.resetForm.value.securityAnswer,
      newPassword: this.resetForm.value.newPassword,
      confirmPassword: this.resetForm.value.confirmPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (response) => {
        console.log(response);

        alert('Password reset successful');

        sessionStorage.removeItem('passwordRecovery');

        this.router.navigate(['/login']);

        this.isSubmitting = false;
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.log('FULL ERROR');
        console.log(error);

        console.log('BACKEND ERRORS');
        console.log(error?.error?.errors);

        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
