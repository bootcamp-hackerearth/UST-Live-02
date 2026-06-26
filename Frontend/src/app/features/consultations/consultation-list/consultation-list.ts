import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ConsultationService } from '../../../core/services/consultation';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './consultation-list.html',
  styleUrls: ['./consultation-list.css']
})
export class ConsultationList implements OnInit, OnDestroy {
  consultations: any[] = [];

  isLoading = false;
  searchTerm = '';
  selectedStatus = '';
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
    hasPreviousPage: false
  };

  constructor(
    private readonly consultationService: ConsultationService
  ) {}

  // Load consultations on page load
  ngOnInit(): void {
    this.loadConsultations();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // Fetch all consultations
  loadConsultations(page = this.pagination.page): void {
    this.isLoading = true;

    const filters = {
      search: this.searchTerm,
      status: this.selectedStatus,
      fromDate: this.fromDate,
      toDate: this.toDate,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.consultationService.getConsultations(page, this.pagination.limit, filters).subscribe({
      next: (response) => {

        this.consultations = response.data || [];
        this.pagination = response.pagination || this.pagination;

        this.isLoading = false;
      },

      error: (error) => {

        this.isLoading = false;
      }
    });
  }

  previousPage(): void {
    if (this.pagination.hasPreviousPage) {
      this.loadConsultations(this.pagination.page - 1);
    }
  }

  nextPage(): void {
    if (this.pagination.hasNextPage) {
      this.loadConsultations(this.pagination.page + 1);
    }
  }

  changeLimit(limit: number): void {
    this.pagination.limit = Number(limit);
    this.loadConsultations(1);
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadConsultations(1);
    }, 500);
  }

  onFilterChange(): void {
    this.loadConsultations(1);
  }

  // Download prescription PDF
  downloadPdf(consultationId: string): void {
    this.consultationService
      .downloadPrescriptionPdf(consultationId)
      .subscribe({
        next: (response: Blob) => {
          const fileURL = globalThis.URL.createObjectURL(response);

          globalThis.open(fileURL);
        },

        error: (error) => {
        }
      });
  }
}
