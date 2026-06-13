import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastService } from '../../../core/services/toast';
import { EmployeeService } from '../../../core/services/employee';

@Component({
  selector: 'app-pending-employees',
  imports: [CommonModule],
  templateUrl: './pending-employees.html',
  styleUrl: './pending-employees.css'
})
export class PendingEmployees implements OnInit {
  pendingEmployees: any[] = [];
  generatedPassword = '';

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load pending employees on page load
  ngOnInit(): void {
    this.loadPendingEmployees();
  }

  // Get all pending employees
  loadPendingEmployees(): void {
    this.employeeService.getPendingEmployees().subscribe({
      next: (response: any) => {
        console.log(response);

        this.pendingEmployees = response.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log(error);
      }
    });
  }

  // Approve employee
  approveEmployee(employee: any): void {
    let consultationFee = null;

    if (employee.designation === 'DOCTOR') {
      const fee = prompt(`Enter consultation fee for Dr. ${employee.name}`);

      if (fee === null || fee.trim() === '' || Number(fee) < 0) {
        alert('Valid consultation fee is required');
        return;
      }

      consultationFee = Number(fee);
    }

    this.employeeService.approveEmployee(employee._id, {
      consultationFee
    }).subscribe({
      next: (response: any) => {
        console.log(response);

        this.toastService.show(
          employee.designation === 'DOCTOR'
            ? `Doctor approved with consultation fee ₹${consultationFee}`
            : 'Employee approved successfully',
          'success'
        );

        this.loadPendingEmployees();
      },

      error: (error) => {
        console.log(error);

        this.toastService.show(
          error?.error?.message || 'Failed to approve employee',
          'error'
        );
      }
    });
  }

  // Reject employee
  rejectEmployee(employeeId: string): void {
    this.employeeService.rejectEmployee(employeeId).subscribe({
      next: (response: any) => {
        console.log(response);

        this.toastService.show('Employee Rejected', 'success');

        this.loadPendingEmployees();
      },

      error: (error) => {
        console.log(error);

        this.toastService.show('Failed to reject employee', 'error');
      }
    });
  }
}