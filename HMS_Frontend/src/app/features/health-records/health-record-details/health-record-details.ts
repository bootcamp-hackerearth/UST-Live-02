import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/services/toast';
import { HealthRecordService } from '../../../core/services/health-record';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ConsultationService } from '../../../core/services/consultation';

@Component({
  selector: 'app-health-record-details',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],

  templateUrl: './health-record-details.html',

  styleUrls: ['./health-record-details.css'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HealthRecordDetails implements OnInit {
  labReportForm!: FormGroup;

  medicalDocumentForm!: FormGroup;

  editingLabReportId: string | null = null;

  editingMedicalDocumentId: string | null = null;
  patient: any;

  consultations: any[] = [];

  expandedTimeline: Record<string, boolean> = {};

  isLoading = true;

  showLabReportModal = false;

  showMedicalDocumentModal = false;
  selectedLabFile: File | null = null;
  labFileError = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  selectedMedicalFile: File | null = null;
  medicalFileError = false;
  isUploadingLabReport = false;

  isUploadingDocument = false;
  timelinePage = 1;
  labPage = 1;
  documentPage = 1;

  readonly pageSize = 5;

  timelineMeta: any = {};
  labMeta: any = {};
  documentMeta: any = {};
  readonly todayDate = this.formatDateInputValue(new Date());
  constructor(
    private readonly route: ActivatedRoute,

    private readonly fb: FormBuilder,

    private readonly healthRecordService: HealthRecordService,

    private readonly consultationService: ConsultationService,

    private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('patientId');
    this.initializeForms();

    if (patientId) {
      this.loadHealthRecord(patientId);
    }
  }

  initializeForms(): void {
    this.labReportForm = this.fb.group({
      title: ['', Validators.required],

      reportType: ['', Validators.required],

      reportDate: ['', [Validators.required, this.notFutureDateValidator]],

      labName: [''],

      doctorName: [''],

      notes: ['']
    });

    this.medicalDocumentForm = this.fb.group({
      title: ['', Validators.required],

      documentType: ['', Validators.required],

      hospitalName: [''],

      doctorName: [''],

      recordDate: ['', [Validators.required, this.notFutureDateValidator]],

      notes: ['']
    });
  }

  notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? { futureDate: true } : null;
  }

  private formatDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  loadHealthRecord(patientId: string, showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading = true;
    }

    const params = {
      timelinePage: this.timelinePage,

      labPage: this.labPage,

      documentPage: this.documentPage,

      limit: this.pageSize
    };

    this.healthRecordService.getHealthRecordDetails(patientId, params).subscribe({
      next: (response) => {
        this.patient = response.data.patient;

        this.consultations = response.data.consultations;

        this.patient.labReports = response.data.labReports;

        this.patient.medicalDocuments = response.data.medicalDocuments;

        this.timelineMeta = response.data.meta.consultations;

        this.labMeta = response.data.meta.labReports;

        this.documentMeta = response.data.meta.medicalDocuments;

        this.isLoading = false;

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(error);

        this.isLoading = false;

        this.cdr.markForCheck();
      }
    });
  }

  toggleTimeline(consultationId: string): void {
    this.expandedTimeline[consultationId] = !this.expandedTimeline[consultationId];
  }

  /*
  |----------------------------------------------------------
  | Lab Report Modal
  |----------------------------------------------------------
  */
  openLabModal(): void {
    this.editingLabReportId = null;

    this.labReportForm.reset();

    this.selectedLabFile = null;
    this.labFileError = false;

    this.showLabReportModal = true;
  }
  onTimelinePageChange(page: number): void {
    if (page < 1 || page > this.timelineMeta?.totalPages) {
      return;
    }

    this.timelinePage = page;

    this.loadHealthRecord(this.patient._id, false);
  }

  onLabPageChange(page: number): void {
    if (page < 1 || page > this.labMeta?.totalPages) {
      return;
    }

    this.labPage = page;

    this.loadHealthRecord(this.patient._id, false);
  }

  onDocumentPageChange(page: number): void {
    if (page < 1 || page > this.documentMeta?.totalPages) {
      return;
    }

    this.documentPage = page;

    this.loadHealthRecord(this.patient._id, false);
  }
  editLabReport(report: any): void {
    this.editingLabReportId = report._id;

    this.labReportForm.patchValue({
      title: report.title,

      reportType: report.reportType,

      reportDate: report.reportDate?.split('T')[0],

      labName: report.labName,

      doctorName: report.doctorName,

      notes: report.notes
    });

    this.selectedLabFile = null;
    this.labFileError = false;

    this.showLabReportModal = true;
  }
  deleteLabReport(reportId: string): void {
    if (!confirm('Delete report?')) {
      return;
    }

    this.healthRecordService.deleteLabReport(this.patient._id, reportId).subscribe({
      next: () => {
        this.toast.success('Lab report deleted successfully');

        this.loadHealthRecord(this.patient._id);
      },

      error: (error) => {
        console.error(error);

        this.toast.error('Unable to delete lab report');
      }
    });
  }

  closeLabModal(): void {
    this.showLabReportModal = false;

    this.labReportForm.reset();

    this.selectedLabFile = null;
    this.labFileError = false;
  }
  saveLabReport(): void {
    this.labFileError = !this.editingLabReportId && !this.selectedLabFile;

    if (this.labReportForm.invalid || this.labFileError) {
      this.labReportForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const formData = new FormData();
    const value = this.labReportForm.value;

    formData.append('title', value.title);

    formData.append('reportType', value.reportType);

    formData.append('reportDate', value.reportDate);

    formData.append('labName', value.labName || '');

    formData.append('doctorName', value.doctorName || '');

    formData.append('notes', value.notes || '');

    if (this.selectedLabFile) {
      formData.append('document', this.selectedLabFile);
    }

    this.isUploadingLabReport = true;
    const request$ = this.editingLabReportId
      ? this.healthRecordService.updateLabReport(this.patient._id, this.editingLabReportId, formData)
      : this.healthRecordService.addLabReport(this.patient._id, formData);

    request$.subscribe({
      next: (response) => {
        this.toast.success(
          this.editingLabReportId ? 'Lab report updated successfully' : 'Lab report added successfully'
        );

        this.closeLabModal();

        this.isUploadingLabReport = false;

        this.loadHealthRecord(this.patient._id);
      },
      error: (error) => {
        console.error(error);

        this.isUploadingLabReport = false;

        this.cdr.markForCheck();

        this.toast.error('Unable to add lab report');
      }
    });
  }
  /*
  |----------------------------------------------------------
  | Medical Document Modal
  |----------------------------------------------------------
  */

  openDocumentModal(): void {
    this.editingMedicalDocumentId = null;

    this.medicalDocumentForm.reset();

    this.selectedMedicalFile = null;
    this.medicalFileError = false;

    this.showMedicalDocumentModal = true;
  }
  editMedicalDocument(document: any): void {
    this.editingMedicalDocumentId = document._id;

    this.medicalDocumentForm.patchValue({
      title: document.title,

      documentType: document.documentType,

      hospitalName: document.hospitalName,

      doctorName: document.doctorName,

      recordDate: document.recordDate?.split('T')[0],

      notes: document.notes
    });

    this.selectedMedicalFile = null;
    this.medicalFileError = false;

    this.showMedicalDocumentModal = true;
  }
  deleteMedicalDocument(documentId: string): void {
    if (!confirm('Delete document?')) {
      return;
    }

    this.healthRecordService.deleteMedicalDocument(this.patient._id, documentId).subscribe({
      next: () => {
        this.toast.success('Medical document deleted successfully');

        this.loadHealthRecord(this.patient._id);
      },

      error: (error) => {
        console.error(error);

        this.toast.error('Unable to delete document');
      }
    });
  }

  closeDocumentModal(): void {
    this.showMedicalDocumentModal = false;

    this.medicalDocumentForm.reset();

    this.selectedMedicalFile = null;
    this.medicalFileError = false;
  }
  saveMedicalDocument(): void {
    this.medicalFileError = !this.editingMedicalDocumentId && !this.selectedMedicalFile;

    if (this.medicalDocumentForm.invalid || this.medicalFileError) {
      this.medicalDocumentForm.markAllAsTouched();

      this.cdr.markForCheck();
      return;
    }

    const formData = new FormData();

    const value = this.medicalDocumentForm.value;

    formData.append('title', value.title);

    formData.append('documentType', value.documentType);

    formData.append('hospitalName', value.hospitalName || '');

    formData.append('doctorName', value.doctorName || '');

    formData.append('recordDate', value.recordDate);

    formData.append('notes', value.notes || '');

    if (this.selectedMedicalFile) {
      formData.append('document', this.selectedMedicalFile);
    }

    this.isUploadingDocument = true;

    const request$ = this.editingMedicalDocumentId
      ? this.healthRecordService.updateMedicalDocument(this.patient._id, this.editingMedicalDocumentId, formData)
      : this.healthRecordService.addMedicalDocument(this.patient._id, formData);

    request$.subscribe({
      next: (response) => {
        this.toast.success(
          this.editingMedicalDocumentId
            ? 'Medical document updated successfully'
            : 'Medical document added successfully'
        );

        this.closeDocumentModal();

        this.isUploadingDocument = false;

        this.loadHealthRecord(this.patient._id);
      },

      error: (error) => {
        console.error(error);

        this.toast.error('Unable to add document');

        this.isUploadingDocument = false;
        this.cdr.markForCheck();
      }
    });
  }
  viewFile(url: string): void {
    window.open(`http://localhost:5000${url}`, '_blank');
  }

  downloadFile(url: string): void {
    const link = document.createElement('a');

    link.href = `http://localhost:5000${url}`;

    link.download = '';

    link.click();
  }
  downloadPdf(consultationId: string): void {
    this.consultationService.downloadPrescriptionPdf(consultationId).subscribe({
      next: (response: Blob) => {
        const fileUrl = URL.createObjectURL(response);

        window.open(fileUrl);
      },

      error: (error) => {
        console.log(error);
      }
    });
  }
  onLabFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedLabFile = input.files?.[0] ?? null;
    this.labFileError = !this.editingLabReportId && !this.selectedLabFile;
  }
  onMedicalFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedMedicalFile = input.files?.[0] ?? null;
    this.medicalFileError = !this.editingMedicalDocumentId && !this.selectedMedicalFile;
  }
  printPage(): void {
    globalThis.print();
  }
}
