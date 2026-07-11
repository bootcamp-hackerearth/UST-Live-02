import { ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../services/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  forgotPasswordForm: FormGroup;

  errorMessage = '';
  successMessage = '';

  isLoading = false;

  constructor(
    readonly fb: FormBuilder,
    readonly auth: Auth,
    readonly router: Router,
    readonly cd: ChangeDetectorRef,
   
  ) {

    this.forgotPasswordForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
    });

  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  sendResetLink(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.auth
      .forgotPassword(this.email?.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({

        next: (res) => {

          this.isLoading = false;

          this.successMessage = res.message;

         
          this.forgotPasswordForm.reset();

          this.cd.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);

        },

        error: (err) => {

          this.isLoading = false;

          this.errorMessage =
            err?.error?.message ||
            'Unable to send password reset email';

         

          this.cd.detectChanges();

        }
      });

  }

}