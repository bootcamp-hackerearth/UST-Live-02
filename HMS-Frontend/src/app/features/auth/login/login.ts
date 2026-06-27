import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth';
import { MenuNodeService } from '../../../core/services/menu-node';
import { TokenService } from '../../../core/services/token';
import { ToastService } from '../../../core/services/toast';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private readonly menuNodeService: MenuNodeService,
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

        localStorage.setItem('loginId', this.loginForm.value.loginId);

        const isFirstLogin = response.data.user.isFirstLogin;

        if (isFirstLogin) {
          this.isSubmitting = false;
          this.router.navigate(['/create-password']);
          return;
        }

        this.redirectUsingMenuNodes();
      },

      error: (error) => {

        this.toastService.show(
          getApiErrorMessage(error, 'Login failed'),
          'error'
        );

        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  private redirectUsingMenuNodes(): void {
    this.menuNodeService.loadMyMenu().subscribe({
      next: (response) => {
        const dashboardPath = this.menuNodeService.getDefaultRedirectPath(
          response.data || []
        );

        this.isSubmitting = false;
        this.router.navigate([dashboardPath]);
      },
      error: () => {
        this.isSubmitting = false;
        this.router.navigate(['/login']);
        this.cdr.detectChanges();
      }
    });
  }
}
