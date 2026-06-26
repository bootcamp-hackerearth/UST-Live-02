import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { EmployeeService } from '../../../core/services/employee';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-employee-list',
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit, OnDestroy {
  employees: any[] = [];
  filteredEmployees: any[] = [];
  searchText = '';
  statusFilter = '';
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
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load employees on page load
  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // Get all employees
  loadEmployees(page = this.pagination.page): void {
    const filters = {
      search: this.searchText,
      status: this.statusFilter,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.employeeService.getEmployees(page, this.pagination.limit, filters).subscribe({
      next: (response: any) => {

        this.employees = response.data || [];
        this.filteredEmployees = [...(response.data || [])];
        this.pagination = response.pagination || this.pagination;

        this.cdr.detectChanges();
      },

      error: (error) => {
      }
    });
  }
  previousPage(): void {
    if (this.pagination.hasPreviousPage) {
      this.loadEmployees(this.pagination.page - 1);
    }
  }

  nextPage(): void {
    if (this.pagination.hasNextPage) {
      this.loadEmployees(this.pagination.page + 1);
    }
  }

  changeLimit(limit: number): void {
    this.pagination.limit = Number(limit);
    this.loadEmployees(1);
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadEmployees(1);
    }, 500);
  }

  // Deactivate employee
  deactivateEmployee(id: string): void {

    this.employeeService.deactivateEmployee(id).subscribe({
      next: () => {

        this.loadEmployees();
      },

      error: (error) => {
      }
    });
  }

  // Activate employee
  activateEmployee(id: string): void {
    this.employeeService.activateEmployee(id).subscribe({
      next: () => {

        this.loadEmployees();
      },

      error: (error) => {
      }
    });
  }

  // Soft delete employee
  deleteEmployee(id: string): void {
    const confirmDelete = confirm('Delete this employee?');

    if (!confirmDelete) {
      return;
    }

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {

        this.loadEmployees();
      },

      error: (error) => {
      }
    });
  }
}
