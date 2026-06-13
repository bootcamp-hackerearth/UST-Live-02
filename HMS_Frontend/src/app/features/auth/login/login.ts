import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth';
import { TokenService } from '../../../core/services/token';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      loginId: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Login user
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      this.toastService.show('Please enter valid credentials', 'error');
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        console.log('API SUCCESS');
        console.log(response);

        const accessToken =response?.data?.accessToken;

const refreshToken =response?.data?.refreshToken;

       this.tokenService.setAccessToken(
  accessToken
);

this.tokenService.setRefreshToken(
  refreshToken
);
        this.authService.currentUser.next(response.data.user);

        this.toastService.show('Login successful', 'success');

        localStorage.setItem('role', response.data.user.roles?.[0]);

        localStorage.setItem('loginId', this.loginForm.value.loginId);

        const isFirstLogin = response.data.user.isFirstLogin;

        if (isFirstLogin) {
          this.isSubmitting = false;
          this.router.navigate(['/create-password']);
          return;
        }

        const role = response.data.user.roles?.[0];

        this.isSubmitting = false;

        if (role === 'ADMIN') {
          this.router.navigate(['/dashboard/admin']);
        } else if (role === 'DOCTOR') {
          this.router.navigate(['/dashboard/doctor']);
        } else if (role === 'RECEPTIONIST') {
          this.router.navigate(['/dashboard/receptionist']);
        } else {
          this.router.navigate(['/login']);
        }
      },

      error: (error) => {
        console.log('API ERROR');
        console.log(error);

        this.toastService.show(
          error?.error?.message || 'Login failed',
          'error'
        );

        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}