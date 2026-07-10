import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPassword implements OnInit {
  readonly isSubmitting = signal(false);
  readonly email = signal('');
  readonly securityQuestion = signal('');

  resetForm: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
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

    this.email.set(navigation?.email || recoveryState?.email || '');
    this.securityQuestion.set(navigation?.securityQuestion || recoveryState?.securityQuestion || '');

    // Redirect if page is opened directly
    if (!this.email() || !this.securityQuestion()) {
      this.router.navigate(['/forgot-password']);
    }
  }

  // Reset password
  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    if (this.resetForm.value.newPassword !== this.resetForm.value.confirmPassword) {
      this.isSubmitting.set(false);

      this.toast.error('Passwords do not match');
      return;
    }

    const payload = {
      email: this.email(),
      securityAnswer: this.resetForm.value.securityAnswer,
      newPassword: this.resetForm.value.newPassword,
      confirmPassword: this.resetForm.value.confirmPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (response) => {
        console.log(response);

        this.toast.success('Password reset successful');

        sessionStorage.removeItem('passwordRecovery');

        this.router.navigate(['/login']);

        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.log('FULL ERROR');
        console.log(error);

        console.log('BACKEND ERRORS');
        console.log(error?.error?.errors);

        this.isSubmitting.set(false);
        this.toast.error(error?.error?.message || 'Unable to reset password');
      }
    });
  }
}
