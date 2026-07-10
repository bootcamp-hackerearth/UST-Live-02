import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast';
import { EmployeeService } from '../../../core/services/employee';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { NodeService } from '../../../core/services/node';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

const FILTER_DEBOUNCE_MS = 350;

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent, SkeletonLoaderComponent, EmptyStateComponent],
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
  cursorStack: string[] = [''];
  nextCursor = '';

  limit = 10;

  total = 0;

  totalPages = 1;

  isLoading = false;

  private readonly filterTextChanged$ = new Subject<void>();

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService,
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly confirmDialog: ConfirmDialogService
  ) {
    this.filterTextChanged$
      .pipe(debounceTime(FILTER_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => this.onFilterChange());
  }

  ngOnInit(): void {
    this.applyEmployeesResponse(this.route.snapshot.data['employees']);

    this.route.queryParamMap.subscribe((params) => {
      if (!params.has('navReset')) {
        return;
      }

      this.resetFilters();
    });
  }

  onFilterTextInput(): void {
    this.filterTextChanged$.next();
  }

  loadEmployees(showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading = true;
    }

    const params: any = {
      page: this.page,
      limit: this.limit,
      pagination: 'cursor',
      cursor: this.cursorStack[this.page - 1] || ''
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
        this.applyEmployeesResponse(response);

        if (this.page > 1 && this.employees.length === 0) {
          this.page = Math.max(this.totalPages || 1, 1);
          this.loadEmployees(false);
          return;
        }

        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);

        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.resetPagination();
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
    if (!this.nextCursor) {
      return;
    }

    this.cursorStack[this.page] = this.nextCursor;
    this.page++;

    this.loadEmployees(false);
  }

  resetFilters(): void {
    this.search = '';
    this.status = '';
    this.department = '';
    this.designation = '';

    this.resetPagination();

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
  async deleteEmployee(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete employee?',
      message: 'This employee will be removed from active records.',
      confirmText: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.page = this.getPageAfterDelete();

        this.toastService.show('Employee deleted successfully', 'success');

        this.loadEmployees();
      },
      error: (error) => {
        this.toastService.show(error?.error?.message || 'Failed to delete employee', 'error');
      }
    });
  }

  private getPageAfterDelete(): number {
    const totalAfterDelete = Math.max(this.total - 1, 0);
    const totalPagesAfterDelete = Math.max(Math.ceil(totalAfterDelete / this.limit), 1);

    return Math.min(this.page, totalPagesAfterDelete);
  }

  private resetPagination(): void {
    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';
  }

  private applyEmployeesResponse(response: any): void {
    this.employees = response?.data || [];
    this.total = response?.meta?.totalRecords ?? response?.meta?.total ?? 0;
    this.totalPages = response?.meta?.totalPages || Math.max(Math.ceil(this.total / this.limit), 1);
    this.nextCursor = response?.meta?.nextCursor || '';
    this.isLoading = false;
  }
}
