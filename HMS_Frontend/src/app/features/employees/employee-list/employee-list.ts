import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast';
import { EmployeeService } from '../../../core/services/employee';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeList implements OnInit {
  employees: any[] = [];

  search = '';

  status = '';

  department = '';

  designation = '';

  page = 1;

  limit = 10;

  total = 0;

  totalPages = 1;

  isLoading = false;

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService,
    public readonly authService: AuthService,
    public readonly nodeService: NodeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading = true;
    }

    const params: any = {
      page: this.page,
      limit: this.limit
    };

    if (this.search) {
      params.search = this.search;
    }

    if (this.status) {
      params.status = this.status;
    }

    if (this.department) {
      params.department = this.department;
    }

    if (this.designation) {
      params.designation = this.designation;
    }

    this.employeeService.getEmployees(params).subscribe({
      next: (response) => {
        this.employees = response.data;

        this.total = response.meta.total;

        this.totalPages = response.meta.totalPages;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log(error);

        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadEmployees(false);
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadEmployees(false);
  }

  previousPage(): void {
    if (this.page === 1) {
      return;
    }

    this.page--;

    this.loadEmployees(false);
  }

  nextPage(): void {
    if (this.page === this.totalPages) {
      return;
    }

    this.page++;

    this.loadEmployees(false);
  }

  resetFilters(): void {
    this.search = '';
    this.status = '';
    this.department = '';
    this.designation = '';

    this.page = 1;

    this.loadEmployees(false);
  }

  deactivateEmployee(id: string): void {
    this.employeeService.deactivateEmployee(id).subscribe({
      next: () => {
        this.loadEmployees();
      }
    });
  }

  activateEmployee(id: string): void {
    this.employeeService.activateEmployee(id).subscribe({
      next: () => {
        this.loadEmployees();
      }
    });
  }
  deleteEmployee(id: string): void {
  if (!confirm('Delete this employee?')) {
    return;
  }

  this.employeeService.deleteEmployee(id).subscribe({
    next: () => {
      this.toastService.show(
        'Employee deleted successfully',
        'success'
      );

      this.loadEmployees();
    },

    error: (error) => {
      this.toastService.show(
        error?.error?.message || 'Failed to delete employee',
        'error'
      );
    }
  });
}
}
