import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { NodeService } from '../../../core/services/node';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { ToastService } from '../../../core/services/toast';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, SkeletonLoaderComponent, EmptyStateComponent],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientList implements OnInit, OnDestroy {
  readonly patients = signal<any[]>([]);
  readonly userRole = signal('');
  readonly search = signal('');
  readonly gender = signal('');
  readonly bloodGroup = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly cursorStack = signal<string[]>(['']);
  readonly nextCursor = signal('');
  readonly totalRecords = signal(0);
  readonly totalPages = signal(0);
  readonly isLoading = signal(false);

  private readonly destroy$ = new Subject<void>();
  protected readonly searchDebounce$ = new Subject<void>();

  constructor(
    private readonly patientService: PatientService,
    public readonly nodeService: NodeService,
    private readonly confirmDialog: ConfirmDialogService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.userRole.set(localStorage.getItem('role') || '');
    this.loadPatients();
    this.searchDebounce$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => this.onFilterChange());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPatients(): void {
    this.isLoading.set(true);

    const params: any = {
      page: this.page(),
      limit: this.limit(),
      pagination: 'cursor',
      cursor: this.cursorStack()[this.page() - 1] || ''
    };

    if (this.search().trim()) {
      params.search = this.search();
    }

    if (this.gender()) {
      params.gender = this.gender();
    }

    if (this.bloodGroup()) {
      params.bloodGroup = this.bloodGroup();
    }

    if (this.startDate()) {
      params.startDate = this.startDate();
    }

    if (this.endDate()) {
      params.endDate = this.endDate();
    }

    this.patientService.getPatients(params).subscribe({
      next: (response) => {
        console.log(response);

        this.patients.set(response.data);

        this.totalRecords.set(response.meta?.totalRecords ?? response.meta?.total ?? 0);
        this.totalPages.set(response.meta?.totalPages || Math.max(Math.ceil(this.totalRecords() / this.limit()), 1));
        this.nextCursor.set(response.meta?.nextCursor || '');

        if (this.page() > 1 && this.patients().length === 0) {
          this.page.set(Math.max(this.totalPages() || 1, 1));
          this.loadPatients();
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

    this.loadPatients();
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.update(p => p - 1);

      this.loadPatients();
    }
  }

  nextPage(): void {
    if (this.nextCursor()) {
      const stack = [...this.cursorStack()];
      stack[this.page()] = this.nextCursor();
      this.cursorStack.set(stack);
      this.page.update(p => p + 1);

      this.loadPatients();
    }
  }

  onPageSizeChange(nextLimit: number): void {
    this.limit.set(nextLimit);
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');

    this.loadPatients();
  }

  async deletePatient(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete patient?',
      message: 'This patient will be removed from active records.',
      confirmText: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.patientService.deletePatient(id).subscribe({
      next: () => {
        this.page.set(this.getPageAfterDelete());
        this.toast.success('Patient deleted successfully');
        this.loadPatients();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  private getPageAfterDelete(): number {
    const totalAfterDelete = Math.max(this.totalRecords() - 1, 0);
    const totalPagesAfterDelete = Math.max(Math.ceil(totalAfterDelete / this.limit()), 1);

    return Math.min(this.page(), totalPagesAfterDelete);
  }
}
