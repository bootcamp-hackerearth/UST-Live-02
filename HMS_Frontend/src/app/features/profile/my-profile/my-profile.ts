import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css'
})
export class MyProfile implements OnInit {
  user: any;

  constructor(private readonly authService: AuthService) {}

  // Load logged-in user profile
  ngOnInit(): void {
    this.authService.currentUser.subscribe({
      next: (response: any) => {
        console.log(response);

        if (response?.employeeId) {
          this.user = response.employeeId;
        } else {
          this.user = {
            name: 'Administrator',
            email: response?.email,
            status: response?.status,
            designation: response?.roles?.[0],
            department: 'Administration',
            employeeCode: 'ADMIN',
            joiningDate: response?.createdAt
          };
        }
      },

      error: (error) => {
        console.log(error);
      }
    });
  }
}