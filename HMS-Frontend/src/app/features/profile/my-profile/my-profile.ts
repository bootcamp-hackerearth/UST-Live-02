import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyProfile {
  private readonly authService = inject(AuthService);

  readonly user = computed(() => {
    const response = this.authService.currentUser();

    if (!response) {
      return null;
    }

    if (response.employeeId) {
      return response.employeeId;
    }

    return {
      name: 'Administrator',
      email: response.email,
      status: response.status,
      designation: response.roles?.[0],
      department: 'Administration',
      employeeCode: 'ADMIN',
      joiningDate: response.createdAt
    };
  });

}
