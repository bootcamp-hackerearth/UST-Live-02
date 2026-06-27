import { Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
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
  isSubmitting = false;
  errorMessage = '';
  forgotForm: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
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

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const email = this.forgotForm.value.email.trim().toLowerCase();

    this.authService.forgotPassword(email).subscribe({
      next: (response: any) => {
        const securityQuestion = response?.data?.securityQuestion;

        if (!securityQuestion) {
          this.errorMessage = 'Security question was not found for this account.';
          this.isSubmitting = false;
          this.cdr.markForCheck();
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

        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to find an account with this email.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
