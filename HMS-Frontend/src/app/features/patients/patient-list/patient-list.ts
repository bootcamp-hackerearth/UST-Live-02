import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
export class PatientList implements OnInit {
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

  constructor(
    private readonly patientService: PatientService,
    public readonly nodeService: NodeService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly confirmDialog: ConfirmDialogService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || '';

    this.applyPatientsResponse(this.route.snapshot.data['patients']);

    this.route.queryParamMap.subscribe((params) => {
      if (!params.has('navReset')) {
        return;
      }

      this.resetFilters();
    });
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
      params.search = this.search;
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

  onFilterChange(): void {
    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';

    this.loadPatients();
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

    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';

    this.loadPatients();
  }

  resetFilters(): void {
    this.search = '';
    this.gender = '';
    this.bloodGroup = '';
    this.startDate = '';
    this.endDate = '';
    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';

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
        this.page = this.getPageAfterDelete();
        this.toast.success('Patient deleted successfully');
        this.loadPatients();
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Failed to delete patient');
        this.cdr.detectChanges();
      }
    });
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
