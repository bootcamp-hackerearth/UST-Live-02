import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { RouterLink } from '@angular/router';
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
  readonly employees = signal<any[]>([]);
  readonly search = signal('');
  readonly status = signal('');
  readonly department = signal('');
  readonly designation = signal('');
  readonly page = signal(1);
  readonly cursorStack = signal<string[]>(['']);
  readonly nextCursor = signal('');
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly isLoading = signal(false);

  private readonly destroy$ = new Subject<void>();
  protected readonly searchDebounce$ = new Subject<void>();

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly toastService: ToastService,
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.searchDebounce$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => this.onFilterChange());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading.set(true);
    }

    const params: any = {
      page: this.page(),
      limit: this.limit(),
      pagination: 'cursor',
      cursor: this.cursorStack()[this.page() - 1] || ''
    };

    if (this.search()) {
      params.search = this.search();
    }

    if (this.status()) {
      params.status = this.status();
    }

    if (this.department()) {
      params.department = this.department();
    }

    if (this.designation()) {
      params.designation = this.designation();
    }

    this.employeeService.getEmployees(params).subscribe({
      next: (response) => {
        this.employees.set(response.data);

        this.total.set(response.meta?.totalRecords ?? response.meta?.total ?? 0);

        this.totalPages.set(response.meta?.totalPages || Math.max(Math.ceil(this.total() / this.limit()), 1));
        this.nextCursor.set(response.meta?.nextCursor || '');

        if (this.page() > 1 && this.employees().length === 0) {
          this.page.set(Math.max(this.totalPages() || 1, 1));
          this.loadEmployees(false);
          return;
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.log(error);

        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');
    this.loadEmployees(false);
  }

  previousPage(): void {
    if (this.page() === 1) {
      return;
    }

    this.page.update(p => p - 1);

    this.loadEmployees(false);
  }

  nextPage(): void {
    if (!this.nextCursor()) {
      return;
    }

    const stack = [...this.cursorStack()];
    stack[this.page()] = this.nextCursor();
    this.cursorStack.set(stack);
    this.page.update(p => p + 1);

    this.loadEmployees(false);
  }

  onPageSizeChange(newLimit: number): void {
    this.limit.set(newLimit);
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');
    this.loadEmployees(false);
  }

  resetFilters(): void {
    this.search.set('');
    this.status.set('');
    this.department.set('');
    this.designation.set('');

    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');

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
        this.page.set(this.getPageAfterDelete());

        this.toastService.show('Employee deleted successfully', 'success');

        this.loadEmployees();
      },
      error: (error) => {
        this.toastService.show(error?.error?.message || 'Failed to delete employee', 'error');
      }
    });
  }

  private getPageAfterDelete(): number {
    const totalAfterDelete = Math.max(this.total() - 1, 0);
    const totalPagesAfterDelete = Math.max(Math.ceil(totalAfterDelete / this.limit()), 1);

    return Math.min(this.page(), totalPagesAfterDelete);
  }
}
