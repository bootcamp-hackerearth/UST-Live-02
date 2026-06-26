import { Component, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastService } from '../../../core/services/toast';
import { EmployeeService } from '../../../core/services/employee';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-pending-employees',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './pending-employees.html',
  styleUrl: './pending-employees.css'
})
export class PendingEmployees implements OnInit, OnDestroy {
  pendingEmployees: any[] = [];
  generatedPassword = '';
  searchText = '';
  sortBy = 'createdAt';
  sortOrder = 'desc';

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  pagination = {
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load pending employees on page load
  ngOnInit(): void {
    this.loadPendingEmployees();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // Get all pending employees
  loadPendingEmployees(page = this.pagination.page): void {
    const filters = {
      search: this.searchText,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.employeeService.getPendingEmployees(page, this.pagination.limit, filters).subscribe({
      next: (response: any) => {

        this.pendingEmployees = response.data || [];
        this.pagination = response.pagination || this.pagination;

        this.cdr.detectChanges();
      },

      error: (error) => {
      }
    });
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadPendingEmployees(1);
    }, 500);
  }
  previousPage(): void {
    if (this.pagination.hasPreviousPage) {
      this.loadPendingEmployees(this.pagination.page - 1);
    }
  }

  nextPage(): void {
    if (this.pagination.hasNextPage) {
      this.loadPendingEmployees(this.pagination.page + 1);
    }
  }

  changeLimit(limit: number): void {
    this.pagination.limit = Number(limit);
    this.loadPendingEmployees(1);
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

    this.employeeService
      .approveEmployee(employee._id, {
        consultationFee
      })
      .subscribe({
        next: (response: any) => {

          this.toastService.show(
            employee.designation === 'DOCTOR'
              ? `Doctor approved with consultation fee ₹${consultationFee}`
              : 'Employee approved successfully',
            'success'
          );

          this.loadPendingEmployees();
        },

        error: (error) => {

          this.toastService.show(
            getApiErrorMessage(error, 'Failed to approve employee'),
            'error'
          );
        }
      });
  }

  // Reject employee
  rejectEmployee(employeeId: string): void {
    this.employeeService.rejectEmployee(employeeId).subscribe({
      next: (response: any) => {

        this.toastService.show('Employee Rejected', 'success');

        this.loadPendingEmployees();
      },

      error: (error) => {

        this.toastService.show('Failed to reject employee', 'error');
      }
    });
  }
}
