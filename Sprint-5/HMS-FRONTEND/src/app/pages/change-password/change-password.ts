import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

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
  isLoading = false;

  constructor(
    readonly auth: Auth,
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

    this.isLoading = true;

    this.auth.changePassword(this.oldPassword, this.newPassword)
      .subscribe({
        next: (res) => {
          console.log('Password changed:', res);

          const storedUser = localStorage.getItem('user');

          if (storedUser) {
            const user = JSON.parse(storedUser);

            user.mustChangePassword = false;

            localStorage.setItem('user', JSON.stringify(user));
          }

          this.message = 'Password changed successfully';

          this.oldPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';

          this.isLoading = false;

          this.router.navigate(['/login']);
        },

        error: (err) => {
          console.log('Change password error:', err);

          this.errorMessage =
            err?.error?.message || 'Password change failed';

          this.isLoading = false;
        }
      });
  }
}