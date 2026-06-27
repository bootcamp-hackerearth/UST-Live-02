import { Component, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiPermissionService } from '../../../core/services/api-permission';
import { PatientService } from '../../../core/services/patient';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.css']
})
export class PatientList implements OnInit, OnDestroy {
  patients: any[] = [];
  filteredPatients: any[] = [];

  searchTerm = '';
  statusFilter = '';
  sortBy = 'createdAt';
  sortOrder = 'desc';
  permissions = new Set<string>();
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
    private readonly apiPermissionService: ApiPermissionService,
    private readonly patientService: PatientService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load patients on page load
  ngOnInit(): void {
    this.loadPermissions();
    this.loadPatients();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // Get all patients
  loadPatients(page = this.pagination.page): void {
    const filters = {
      search: this.searchTerm,
      status: this.statusFilter,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.patientService.getPatients(page, this.pagination.limit, filters).subscribe({
      next: (response) => {

        this.patients = response.data || [];
        this.filteredPatients = response.data || [];
        this.pagination = response.pagination || this.pagination;

        this.cdr.detectChanges();
      },

      error: (error) => {
      }
    });
  }

  loadPermissions(): void {
    this.apiPermissionService.getMyPermissions().subscribe({
      next: (response) => {
        this.permissions = new Set(response.data || []);
        this.cdr.detectChanges();
      },
      error: () => {
        this.permissions = new Set<string>();
        this.cdr.detectChanges();
      }
    });
  }

  canUpdatePatient(): boolean {
    return this.permissions.has('patient:update');
  }

  canDeletePatient(): boolean {
    return this.permissions.has('patient:delete');
  }

  previousPage(): void {
    if (this.pagination.hasPreviousPage) {
      this.loadPatients(this.pagination.page - 1);
    }
  }

  nextPage(): void {
    if (this.pagination.hasNextPage) {
      this.loadPatients(this.pagination.page + 1);
    }
  }

  changeLimit(limit: number): void {
    this.pagination.limit = Number(limit);
    this.loadPatients(1);
  }

  // Debounce search input before filtering
  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadPatients(1);
    }, 500);
  }

  // Soft delete patient
  deletePatient(id: string): void {
    const confirmDelete = confirm('Delete this patient?');

    if (!confirmDelete) {
      return;
    }

    this.patientService.deletePatient(id).subscribe({
      next: () => {

        this.loadPatients();
      },

      error: (error) => {
      }
    });
  }
}
