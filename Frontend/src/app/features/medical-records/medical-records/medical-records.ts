import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { ApiPermissionService } from '../../../core/services/api-permission';
import { MedicalRecordService } from '../../../core/services/medical-record';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { getApiErrorMessage as getApiErrorMessageFromResponse } from '../../../core/utils/api-error';

type MedicalRecordTab = 'prescriptions' | 'healthRecords' | 'labReports';

const createPagination = () => ({
  page: 1,
  limit: 10,
  totalRecords: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false
});

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './medical-records.html',
  styleUrl: './medical-records.css'
})
export class MedicalRecords implements OnInit {
  activeTab: MedicalRecordTab = 'prescriptions';
  prescriptions: any[] = [];
  healthRecords: any[] = [];
  labReports: any[] = [];
  isLoading = false;
  isSavingHealthRecord = false;
  isSavingLabReport = false;
  editingHealthRecordId = '';
  editingLabReportId = '';
  healthRecordMessage = '';
  healthRecordError = '';
  labReportMessage = '';
  labReportError = '';
  patientId = '';
  permissions = new Set<string>();
  prescriptionPagination = createPagination();
  healthRecordPagination = createPagination();
  labReportPagination = createPagination();

  selectedHealthRecordFile: File | null = null;
  selectedLabReportFile: File | null = null;

  documentTypes = [
    'PREVIOUS_DISCHARGE_SUMMARY',
    'SCAN_REPORT',
    'OTHER'
  ];

  healthRecordForm: any = {
    title: '',
    documentType: '',
    documentDate: '',
    notes: ''
  };

  labReportForm: any = {
    title: '',
    documentDate: '',
    notes: ''
  };

  private readonly fileBaseUrl = API_BASE_URL.replace('/api', '');

  constructor(
    private readonly medicalRecordService: MedicalRecordService,
    private readonly apiPermissionService: ApiPermissionService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId') || '';
    this.loadPermissions();
    this.loadPrescriptions();
  }

  setActiveTab(tab: MedicalRecordTab): void {
    this.activeTab = tab;

    if (tab === 'prescriptions') {
      this.loadPrescriptions();
      return;
    }

    if (tab === 'healthRecords') {
      this.loadHealthRecords();
      return;
    }

    this.loadLabReports();
  }

  loadPrescriptions(): void {
    this.isLoading = true;

    const request$ = this.patientId
      ? this.medicalRecordService.getPatientPrescriptions(
          this.patientId,
          this.prescriptionPagination.page,
          this.prescriptionPagination.limit
        )
      : this.medicalRecordService.getPrescriptions(
          this.prescriptionPagination.page,
          this.prescriptionPagination.limit
        );

    request$.subscribe({
        next: (response) => {
          this.prescriptions = response.data || [];
          this.prescriptionPagination =
            response.pagination || this.prescriptionPagination;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadLabReports(): void {
    this.isLoading = true;

    const request$ = this.patientId
      ? this.medicalRecordService.getPatientLabReports(
          this.patientId,
          this.labReportPagination.page,
          this.labReportPagination.limit
        )
      : this.medicalRecordService.getLabReports(
          this.labReportPagination.page,
          this.labReportPagination.limit
        );

    request$.subscribe({
      next: (response) => {
        this.labReports = response.data || [];
        this.labReportPagination = response.pagination || this.labReportPagination;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.labReports = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadHealthRecords(): void {
    this.isLoading = true;

    const request$ = this.patientId
      ? this.medicalRecordService.getPatientHealthRecords(
          this.patientId,
          this.healthRecordPagination.page,
          this.healthRecordPagination.limit
        )
      : this.medicalRecordService.getHealthRecords(
          this.healthRecordPagination.page,
          this.healthRecordPagination.limit
        );

    request$.subscribe({
      next: (response) => {
        this.healthRecords = response.data || [];
        this.healthRecordPagination =
          response.pagination || this.healthRecordPagination;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.healthRecords = [];
        this.isLoading = false;
        this.cdr.detectChanges();
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

  canManageHealthRecords(): boolean {
    return this.hasPermission('medical-record:health-record-create');
  }

  canUpdateHealthRecords(): boolean {
    return this.hasPermission('medical-record:health-record-update');
  }

  canDeleteHealthRecords(): boolean {
    return this.hasPermission('medical-record:health-record-delete');
  }

  canManageLabReports(): boolean {
    return this.hasPermission('medical-record:lab-report-create');
  }

  canUpdateLabReports(): boolean {
    return this.hasPermission('medical-record:lab-report-update');
  }

  canDeleteLabReports(): boolean {
    return this.hasPermission('medical-record:lab-report-delete');
  }

  canShowHealthRecordForm(): boolean {
    return this.canManageHealthRecords() || (
      Boolean(this.editingHealthRecordId) && this.canUpdateHealthRecords()
    );
  }

  canShowLabReportForm(): boolean {
    return this.canManageLabReports() || (
      Boolean(this.editingLabReportId) && this.canUpdateLabReports()
    );
  }

  startEditHealthRecord(record: any): void {
    this.editingHealthRecordId = record._id;
    this.healthRecordMessage = '';
    this.healthRecordError = '';

    this.healthRecordForm = {
      title: record.title || '',
      documentType: record.documentType || '',
      documentDate: record.documentDate ? record.documentDate.split('T')[0] : '',
      notes: record.notes || ''
    };
    this.selectedHealthRecordFile = null;
  }

  resetHealthRecordForm(): void {
    this.editingHealthRecordId = '';
    this.healthRecordMessage = '';
    this.healthRecordError = '';
    this.selectedHealthRecordFile = null;
    this.healthRecordForm = {
      title: '',
      documentType: '',
      documentDate: '',
      notes: ''
    };
  }

  saveHealthRecord(): void {
    this.healthRecordMessage = '';
    this.healthRecordError = '';

    if (!this.patientId) {
      this.healthRecordError = 'Select a patient before adding health records.';
      this.cdr.detectChanges();
      return;
    }

    if (
      !this.healthRecordForm.title ||
      !this.healthRecordForm.documentType ||
      !this.healthRecordForm.documentDate
    ) {
      this.healthRecordError = 'Title, document type and document date are required.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.editingHealthRecordId && !this.selectedHealthRecordFile) {
      this.healthRecordError = 'Document file is required.';
      this.cdr.detectChanges();
      return;
    }

    this.isSavingHealthRecord = true;

    const payload = this.getHealthRecordPayload();
    const request$ = this.editingHealthRecordId
      ? this.medicalRecordService.updateHealthRecord(
          this.editingHealthRecordId,
          payload
        )
      : this.medicalRecordService.createHealthRecord(payload);

    request$.pipe(
      timeout(30000),
      finalize(() => {
        this.isSavingHealthRecord = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        const message = this.editingHealthRecordId
          ? 'Health record updated successfully.'
          : 'Health record created successfully.';
        this.resetHealthRecordForm();
        this.healthRecordMessage = message;
        this.loadHealthRecords();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.healthRecordError =
          error?.name === 'TimeoutError'
            ? 'Saving is taking too long. Please check backend server and try again.'
            : this.getApiErrorMessage(error, 'Failed to save health record.');
        this.cdr.detectChanges();
      }
    });
  }

  deleteHealthRecord(record: any): void {
    if (!confirm('Delete this health record?')) {
      return;
    }

    this.medicalRecordService.deleteHealthRecord(record._id).subscribe({
      next: () => {
        this.healthRecordMessage = 'Health record deleted successfully.';
        this.loadHealthRecords();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.healthRecordError = this.getApiErrorMessage(
          error,
          'Failed to delete health record.'
        );
        this.cdr.detectChanges();
      }
    });
  }

  startEditLabReport(record: any): void {
    this.editingLabReportId = record._id;
    this.labReportMessage = '';
    this.labReportError = '';

    this.labReportForm = {
      title: record.title || '',
      documentDate: record.documentDate ? record.documentDate.split('T')[0] : '',
      notes: record.notes || ''
    };
    this.selectedLabReportFile = null;
  }

  resetLabReportForm(): void {
    this.editingLabReportId = '';
    this.labReportMessage = '';
    this.labReportError = '';
    this.selectedLabReportFile = null;
    this.labReportForm = {
      title: '',
      documentDate: '',
      notes: ''
    };
  }

  saveLabReport(): void {
    this.labReportMessage = '';
    this.labReportError = '';

    if (!this.patientId) {
      this.labReportError = 'Select a patient before adding lab reports.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.labReportForm.title || !this.labReportForm.documentDate) {
      this.labReportError = 'Title and report date are required.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.editingLabReportId && !this.selectedLabReportFile) {
      this.labReportError = 'Lab report file is required.';
      this.cdr.detectChanges();
      return;
    }

    this.isSavingLabReport = true;

    const payload = this.getLabReportPayload();
    const request$ = this.editingLabReportId
      ? this.medicalRecordService.updateLabReport(this.editingLabReportId, payload)
      : this.medicalRecordService.createLabReport(payload);

    request$.pipe(
      timeout(30000),
      finalize(() => {
        this.isSavingLabReport = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        const message = this.editingLabReportId
          ? 'Lab report updated successfully.'
          : 'Lab report uploaded successfully.';
        this.resetLabReportForm();
        this.labReportMessage = message;
        this.loadLabReports();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.labReportError =
          error?.name === 'TimeoutError'
            ? 'Saving is taking too long. Please check backend server and try again.'
            : this.getApiErrorMessage(error, 'Failed to save lab report.');
        this.cdr.detectChanges();
      }
    });
  }

  deleteLabReport(record: any): void {
    if (!confirm('Delete this lab report?')) {
      return;
    }

    this.medicalRecordService.deleteLabReport(record._id).subscribe({
      next: () => {
        this.labReportMessage = 'Lab report deleted successfully.';
        this.loadLabReports();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.labReportError = this.getApiErrorMessage(
          error,
          'Failed to delete lab report.'
        );
        this.cdr.detectChanges();
      }
    });
  }

  formatOption(value: string): string {
    return value.replace(/_/g, ' ');
  }

  onHealthRecordFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedHealthRecordFile = input.files?.[0] || null;
    this.cdr.detectChanges();
  }

  onLabReportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedLabReportFile = input.files?.[0] || null;
    this.cdr.detectChanges();
  }

  getDocumentUrl(record: any): string {
    if (!record?.filePath) {
      return '';
    }

    return `${this.fileBaseUrl}${record.filePath}`;
  }

  getTotalRecords(): number {
    if (this.activeTab === 'healthRecords') {
      return this.healthRecordPagination.totalRecords;
    }

    if (this.activeTab === 'labReports') {
      return this.labReportPagination.totalRecords;
    }

    return this.prescriptionPagination.totalRecords;
  }

  previousPage(): void {
    const pagination = this.getActivePagination();

    if (!pagination.hasPreviousPage) {
      return;
    }

    pagination.page -= 1;
    this.loadActiveTabRecords();
  }

  nextPage(): void {
    const pagination = this.getActivePagination();

    if (!pagination.hasNextPage) {
      return;
    }

    pagination.page += 1;
    this.loadActiveTabRecords();
  }

  onLimitChange(limit: number): void {
    const pagination = this.getActivePagination();
    pagination.page = 1;
    pagination.limit = limit;
    this.loadActiveTabRecords();
  }

  getActivePagination(): any {
    if (this.activeTab === 'healthRecords') {
      return this.healthRecordPagination;
    }

    if (this.activeTab === 'labReports') {
      return this.labReportPagination;
    }

    return this.prescriptionPagination;
  }

  private getHealthRecordPayload(): any {
    const formData = new FormData();
    formData.append('patientId', this.patientId);
    formData.append('title', this.healthRecordForm.title);
    formData.append('documentType', this.healthRecordForm.documentType);
    formData.append('documentDate', this.healthRecordForm.documentDate);

    if (this.healthRecordForm.notes) {
      formData.append('notes', this.healthRecordForm.notes);
    }

    if (this.selectedHealthRecordFile) {
      formData.append('documentFile', this.selectedHealthRecordFile);
    }

    return formData;
  }

  private getLabReportPayload(): any {
    const formData = new FormData();
    formData.append('patientId', this.patientId);
    formData.append('title', this.labReportForm.title);
    formData.append('documentDate', this.labReportForm.documentDate);

    if (this.labReportForm.notes) {
      formData.append('notes', this.labReportForm.notes);
    }

    if (this.selectedLabReportFile) {
      formData.append('documentFile', this.selectedLabReportFile);
    }

    return formData;
  }

  private getApiErrorMessage(error: any, fallback: string): string {
    return getApiErrorMessageFromResponse(error, fallback);
  }

  private hasPermission(permissionKey: string): boolean {
    return this.permissions.has(permissionKey);
  }

  private loadActiveTabRecords(): void {
    if (this.activeTab === 'healthRecords') {
      this.loadHealthRecords();
      return;
    }

    if (this.activeTab === 'labReports') {
      this.loadLabReports();
      return;
    }

    this.loadPrescriptions();
  }
}
