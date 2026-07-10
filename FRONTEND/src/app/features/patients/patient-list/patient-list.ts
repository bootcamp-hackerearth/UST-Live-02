import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  patients: any[] = [];

  userRole = '';

  search = '';
  gender = '';
  bloodGroup = '';

  startDate = '';
  endDate = '';

  page = 1;
  limit = 10;
  cursorStack: string[] = [''];
  nextCursor = '';

  totalRecords = 0;
  totalPages = 0;
  isLoading = false;

  private readonly searchInput$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly patientService: PatientService,
    public readonly nodeService: NodeService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly confirmDialog: ConfirmDialogService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.reloadFromFirstPage());

    this.userRole = localStorage.getItem('role') || '';

    this.applyPatientsResponse(this.route.snapshot.data['patients']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPatients(): void {
    this.isLoading = true;

    const params: any = {
      page: this.page,
      limit: this.limit,
      pagination: 'cursor',
      cursor: this.cursorStack[this.page - 1] || ''
    };

    if (this.search.trim()) {
      params.search = this.search.trim();
    }

    if (this.gender) {
      params.gender = this.gender;
    }

    if (this.bloodGroup) {
      params.bloodGroup = this.bloodGroup;
    }

    if (this.startDate) {
      params.startDate = this.startDate;
    }

    if (this.endDate) {
      params.endDate = this.endDate;
    }

    this.patientService.getPatients(params).subscribe({
      next: (response) => {
        console.log(response);

        this.applyPatientsResponse(response);

        if (this.page > 1 && this.patients.length === 0) {
          this.page = Math.max(this.totalPages || 1, 1);
          this.loadPatients();
          return;
        }

        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);

        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }

  onSearchInput(): void {
    this.searchInput$.next(this.search.trim());
  }

  onFilterChange(): void {
    this.reloadFromFirstPage();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;

      this.loadPatients();
    }
  }

  nextPage(): void {
    if (this.nextCursor) {
      this.cursorStack[this.page] = this.nextCursor;
      this.page++;

      this.loadPatients();
    }
  }

  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.limit = Number(select.value);

    this.reloadFromFirstPage();
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
        this.page = this.getPageAfterDelete();
        this.toast.success('Patient deleted successfully');
        this.loadPatients();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  private reloadFromFirstPage(): void {
    this.resetPagination();
    this.loadPatients();
  }

  private resetPagination(): void {
    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';
  }

  private getPageAfterDelete(): number {
    const totalAfterDelete = Math.max(this.totalRecords - 1, 0);
    const totalPagesAfterDelete = Math.max(Math.ceil(totalAfterDelete / this.limit), 1);

    return Math.min(this.page, totalPagesAfterDelete);
  }

  private applyPatientsResponse(response: any): void {
    this.patients = response?.data || [];
    this.totalRecords = response?.meta?.totalRecords ?? response?.meta?.total ?? 0;
    this.totalPages = response?.meta?.totalPages || Math.max(Math.ceil(this.totalRecords / this.limit), 1);
    this.nextCursor = response?.meta?.nextCursor || '';
    this.isLoading = false;
  }
}



