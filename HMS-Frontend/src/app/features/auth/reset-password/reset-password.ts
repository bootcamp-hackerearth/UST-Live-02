import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  isSubmitting = false;

  email = '';
  securityQuestion = '';
  errorMessage = '';

  resetForm: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
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

    this.email = navigation?.email;
    this.securityQuestion = navigation?.securityQuestion;

    // Redirect if page is opened directly
    if (!this.email || !this.securityQuestion) {
      this.router.navigate(['/forgot-password']);
    }
  }

  // Reset password
  onSubmit(): void {
    this.errorMessage = '';

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    if (
      this.resetForm.value.newPassword !==
      this.resetForm.value.confirmPassword
    ) {
      this.isSubmitting = false;

      alert('Passwords do not match');
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

        alert('Password reset successful');

        this.router.navigate(['/login']);

        this.isSubmitting = false;
      },

      error: (error) => {


        this.isSubmitting = false;
        this.errorMessage =
          getApiErrorMessage(error, 'Failed to reset password');
      }
    });
  }
}
