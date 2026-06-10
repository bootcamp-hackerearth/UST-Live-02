import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  isSubmitting = false;
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

    this.isSubmitting = true;

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (response: any) => {
        console.log(response);

        this.router.navigate(['/reset-password'], {
          state: {
            email: this.forgotForm.value.email,
            securityQuestion: response?.securityQuestion
          }
        });

        this.isSubmitting = false;
      },
      error: (error) => {
        console.log(error);
        this.isSubmitting = false;
      }
    });
  }
}