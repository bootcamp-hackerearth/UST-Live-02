import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  message = '';
  errorMessage = '';

  constructor(
    readonly http: HttpClient,
    readonly router: Router
  ) {}

  changePassword() {
    this.message = '';
    this.errorMessage = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match';
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage = 'Session expired. Please login again.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const body = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.http.post('http://localhost:5000/api/auth/change-password', body, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Password changed:', res);

          this.message = 'Password changed successfully';

          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.mustChangePassword = false;
          localStorage.setItem('user', JSON.stringify(user));

          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1000);
        },
        error: (err) => {
          console.log('Change password error:', err);
          this.errorMessage = err.error?.message || 'Password change failed';
        }
      });
  }
}