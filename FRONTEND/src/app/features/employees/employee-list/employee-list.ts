import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast';
import { EmployeeService } from '../../../core/services/employee';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { NodeService } from '../../../core/services/node';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent, SkeletonLoaderComponent, EmptyStateComponent],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeList implements OnInit, OnDestroy {
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

  private readonly searchInput$ = new Subject<string>();
  private readonly textFilterInput$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService,
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.reloadFromFirstPage());

    this.textFilterInput$
      .pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => this.reloadFromFirstPage());

    this.applyEmployeesResponse(this.route.snapshot.data['employees']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    if (this.search.trim()) {
      params.search = this.search.trim();
    }

    if (this.status.trim()) {
      params.status = this.status.trim();
    }

    if (this.department.trim()) {
      params.department = this.department.trim();
    }

    if (this.designation.trim()) {
      params.designation = this.designation.trim();
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
        this.toastService.show(error?.error?.message || 'Failed to load employees', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.searchInput$.next(this.search.trim());
  }

  onTextFilterChange(): void {
    this.textFilterInput$.next();
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

  onPageSizeChange(limit: number): void {
    this.limit = limit;
    this.resetPagination();
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

  private reloadFromFirstPage(): void {
    this.resetPagination();
    this.loadEmployees(false);
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




