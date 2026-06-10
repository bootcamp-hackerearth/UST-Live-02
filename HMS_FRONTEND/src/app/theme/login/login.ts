import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.htm',
  styleUrl: './login.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterModule],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  auth: AuthService = inject(AuthService);
  router: Router = inject(Router);
  toast: ToastrService = inject(ToastrService);

  constructor(readonly fb: FormBuilder) {
    this.loginForm = this.createForm();
  }

  ngOnInit(): void {
    this.clearLocalStorage();
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.toast.warning('Please fill the required fields.');
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.auth.login(payload).subscribe({
      next: (res) => this.handleLoginSuccess(res),
      error: (error) => this.handleLoginError(error),
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: [
        '',
        [
          Validators.email,
          Validators.required,
          Validators.pattern(/^[a-z0-9._]+@[a-z0-9]*\.[a-z]{2,}$/i),
        ],
      ],
      password: ['', [Validators.required]],
    });
  }

  private clearLocalStorage(): void {
    localStorage.clear();
  }

  private handleLoginSuccess(res: any): void {
    if (res.status !== 'Active') {
      this.toast.info('Your account is not activated yet,Please contact the admin');
      this.router.navigate(['/login']);
      return;
    }

    localStorage.setItem('token', res.token);
    localStorage.setItem('email', res.email);
    localStorage.setItem('role', res.role);

    if (res.firstLogin) {
      this.toast.info('Set your password');
      this.router.navigate(['/password-modal']);
      return;
    }

    this.toast.success('Login Sucessfull');
    this.router.navigate(['/profile']);
  }

  private handleLoginError(error: any): void {
    if (error.status === 401) {
      this.toast.warning('Invalid email or password');
      return;
    }

    this.toast.error(error?.error?.message || error?.message || 'Login Failed!');
  }
}
