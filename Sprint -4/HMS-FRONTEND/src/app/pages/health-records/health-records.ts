import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HealthRecordService } from '../../services/health-record.service';
import { HealthRecord } from '../../models/health-record.model';

@Component({
  selector: 'app-health-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-records.html',
  styleUrl: './health-records.css'
})
export class HealthRecords implements OnInit {
  loading = signal(false);
  errorMessage = signal('');
  searchText = signal('');

  healthRecords = signal<HealthRecord[]>([]);

  currentPage = signal(1);
  pageSize = 10;
  totalRecords = signal(0);
  totalPages = signal(0);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    readonly healthRecordService: HealthRecordService,
    readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadHealthRecords();
  }

  loadHealthRecords(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.healthRecordService
      .getHealthRecords(
        this.currentPage(),
        this.pageSize,
        this.searchText().trim()
      )
      .subscribe({
        next: (res) => {

          console.log('Health record list response:', res.data);
          console.log('First record doctor:', res.data?.[0]?.doctorId);
          this.healthRecords.set(res.data || []);

          this.totalRecords.set(res.pagination.totalRecords);
          this.totalPages.set(res.pagination.totalPages);
          this.currentPage.set(res.pagination.page);

          this.loading.set(false);
        },
        error: (error: any) => {
          this.errorMessage.set(
            error?.error?.message || 'Unable to load health records'
          );

          this.healthRecords.set([]);
          this.totalRecords.set(0);
          this.totalPages.set(0);
          this.loading.set(false);
        }
      });
  }

  filterHealthRecords(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.loadHealthRecords();
    }, 300);
  }

  get startRecord(): number {
    if (this.totalRecords() === 0) {
      return 0;
    }

    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.currentPage() * this.pageSize,
      this.totalRecords()
    );
  }

  goToPreviousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.currentPage.update((page) => page - 1);
    this.loadHealthRecords();
  }

  goToNextPage(): void {
    if (this.currentPage() >= this.totalPages()) {
      return;
    }

    this.currentPage.update((page) => page + 1);
    this.loadHealthRecords();
  }

  getPatientName(record: HealthRecord): string {
    if (typeof record.patientId === 'string') {
      return '-';
    }

    const firstName = record.patientId?.firstName || '';
    const lastName = record.patientId?.lastName || '';

    return `${firstName} ${lastName}`.trim() || '-';
  }

  getDoctorName(record: HealthRecord): string {
  const directDoctor =
    typeof record.doctorId === 'string'
      ? null
      : record.doctorId;

  const appointmentDoctor =
    typeof record.appointmentId === 'string'
      ? null
      : record.appointmentId?.doctorId;

  const user =
    directDoctor?.employeeId?.userId ||
    appointmentDoctor?.employeeId?.userId;

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  return `${firstName} ${lastName}`.trim() || '-';
}

  getAppointmentCode(record: HealthRecord): string {
    if (typeof record.appointmentId === 'string') {
      return '-';
    }

    return record.appointmentId?.appointmentCode || '-';
  }

  getAppointmentId(record: HealthRecord): string {
    if (typeof record.appointmentId === 'string') {
      return record.appointmentId;
    }

    return record.appointmentId?._id || '';
  }

  viewAppointmentDetails(record: HealthRecord): void {
    const appointmentId = this.getAppointmentId(record);

    if (!appointmentId) {
      return;
    }

    const basePath = localStorage.getItem('basePath') || '/admin';

    this.router.navigate(
      [`${basePath}/appointments/details`, appointmentId],
      {
        queryParams: {
          returnTo: 'health-records'
        }
      }
    );
  }
}