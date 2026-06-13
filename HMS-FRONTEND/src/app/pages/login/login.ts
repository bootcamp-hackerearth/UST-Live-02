import { ChangeDetectorRef, Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timeout, finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    readonly auth: Auth,
    readonly router: Router,
    readonly fb: FormBuilder,
    readonly cd:ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ],
      password: [
        '',
        [
          Validators.required
        ]
      ]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onLogin(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.cd.detectChanges();
      return;
    }

    this.isLoading = true;

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.auth.login(loginData)
      .pipe(
        timeout(5000),
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          console.log('LOGIN RESPONSE:', res);

          const user = res.data.user;
          const basePath = user.roleId.basePath;

          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', user.roleId.name);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('basePath', basePath);

          if (user.mustChangePassword === true) {
            this.router.navigate(['/change-password']);
            return;
          }

          if (user.roleId.name === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (user.roleId.name === 'Receptionist') {
            this.router.navigate([`${basePath}/patients`]);
          } else if (user.roleId.name === 'Doctor') {
            this.router.navigate([`${basePath}/appointments`]);
          } else {
            this.errorMessage = 'No dashboard route found for this user role.';
          }
        },

        error: (err) => {
          console.log('LOGIN ERROR:', err);

          if (err.name === 'TimeoutError') {
            this.errorMessage = 'Login is taking too long. Please try again.';
            return;
          }

          // ✅ HANDLE 403 FORBIDDEN
          if (err?.status === 403) {
            this.errorMessage = err?.error?.message || 'Access Denied';
            return;
          }

          this.errorMessage =
            err?.error?.message ||
            err?.error?.data?.message ||
            err?.message ||
            'Invalid email or password';
          console.log('LOGIN ERROR MESSAGE:', this.errorMessage);
        }
      });
  }
}