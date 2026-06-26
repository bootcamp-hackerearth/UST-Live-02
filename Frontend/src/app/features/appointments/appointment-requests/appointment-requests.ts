import { Component, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppointmentService } from '../../../core/services/appointment';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-appointment-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './appointment-requests.html',
  styleUrls: ['./appointment-requests.css'],
})
export class AppointmentRequestsComponent implements OnInit, OnDestroy {
  appointments: any[] = [];
  loading = false;
  searchTerm = '';
  fromDate = '';
  toDate = '';
  sortBy = 'createdAt';
  sortOrder = 'desc';

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  pagination = {
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPendingAppointments();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadPendingAppointments(page = this.pagination.page): void {
    this.loading = true;

    const filters = {
      search: this.searchTerm,
      fromDate: this.fromDate,
      toDate: this.toDate,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.appointmentService
      .getPendingAppointments(page, this.pagination.limit, filters)
      .subscribe({
        next: (response) => {
          this.appointments = response.data || [];
          this.pagination = response.pagination || this.pagination;
          this.loading = false;

          this.cdr.detectChanges();
        },

        error: () => {
          this.loading = false;
        },
      });
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadPendingAppointments(1);
    }, 500);
  }

  onFilterChange(): void {
    this.loadPendingAppointments(1);
  }

  previousPage(): void {
    if (this.pagination.hasPreviousPage) {
      this.loadPendingAppointments(this.pagination.page - 1);
    }
  }

  nextPage(): void {
    if (this.pagination.hasNextPage) {
      this.loadPendingAppointments(this.pagination.page + 1);
    }
  }

  approve(id: string): void {
    this.appointmentService.approveAppointment(id).subscribe({
      next: () => {
        this.loadPendingAppointments();
      },
    });
  }

  reject(id: string): void {
    this.appointmentService.rejectAppointment(id).subscribe({
      next: () => {
        this.loadPendingAppointments();
      },
    });
  }
}
