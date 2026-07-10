import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPassword {
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  forgotForm: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Submit forgot password request
  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const email = this.forgotForm.value.email.trim().toLowerCase();

    this.authService.forgotPassword(email).subscribe({
      next: (response: any) => {
        const securityQuestion = response?.data?.securityQuestion;

        if (!securityQuestion) {
          this.errorMessage.set('Security question was not found for this account.');
          this.isSubmitting.set(false);
          return;
        }

        sessionStorage.setItem(
          'passwordRecovery',
          JSON.stringify({
            email,
            securityQuestion
          })
        );

        this.router.navigate(['/reset-password'], {
          state: {
            email,
            securityQuestion
          }
        });

        this.isSubmitting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Unable to find an account with this email.');
        this.isSubmitting.set(false);
      }
    });
  }
}
