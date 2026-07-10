import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/services/toast';
import { HealthRecordService } from '../../../core/services/health-record';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ConsultationService } from '../../../core/services/consultation';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-health-record-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent, SkeletonLoaderComponent],
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
  labFileError = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  selectedMedicalFile: File | null = null;
  medicalFileError = '';
  isUploadingLabReport = false;

  isUploadingDocument = false;
  isDownloadingRecord = false;
  timelinePage = 1;
  labPage = 1;
  documentPage = 1;

  readonly pageSize = 5;
  readonly maxUploadSizeBytes = 5 * 1024 * 1024;
  readonly maxUploadSizeLabel = '5 MB';

  timelineMeta: any = {};
  labMeta: any = {};
  documentMeta: any = {};
  readonly todayDate = this.formatDateInputValue(new Date());
  readonly canDeleteHealthRecordDocuments = ['SUPER_ADMIN', 'ADMIN'].includes(localStorage.getItem('role') || '');
  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly healthRecordService: HealthRecordService,
    private readonly consultationService: ConsultationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService,
    private readonly confirmDialog: ConfirmDialogService
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

        this.consultations = response.data.consultations ?? [];

        this.patient.labReports = response.data.labReports ?? [];

        this.patient.medicalDocuments = response.data.medicalDocuments ?? [];

        this.timelineMeta = response.data.meta.consultations;

        this.labMeta = response.data.meta.labReports;

        this.documentMeta = response.data.meta.medicalDocuments;

        if (this.correctEmptyPagesAfterLoad()) {
          return;
        }

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

  /* Lab Report Modal */
  openLabModal(): void {
    this.editingLabReportId = null;

    this.labReportForm.reset();

    this.selectedLabFile = null;
    this.labFileError = '';

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
    this.labFileError = '';

    this.showLabReportModal = true;
  }
  async deleteLabReport(reportId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete lab report?',
      message: 'This report will be removed from the patient record.',
      confirmText: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.healthRecordService.deleteLabReport(this.patient._id, reportId).subscribe({
      next: () => {
        this.toast.success('Lab report deleted successfully');

        this.labPage = this.getPageAfterDelete(this.labMeta);

        this.loadHealthRecord(this.patient._id, false);
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
    this.labFileError = '';
  }
  saveLabReport(): void {
    this.labFileError = this.getFileValidationError(
      this.selectedLabFile,
      !this.editingLabReportId,
      'Report file is required'
    );

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

        this.toast.error(
          this.getHttpErrorMessage(
            error,
            this.editingLabReportId ? 'Unable to update lab report' : 'Unable to add lab report'
          )
        );
      }
    });
  }
  /* Medical Document Modal */
  openDocumentModal(): void {
    this.editingMedicalDocumentId = null;

    this.medicalDocumentForm.reset();

    this.selectedMedicalFile = null;
    this.medicalFileError = '';

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
    this.medicalFileError = '';

    this.showMedicalDocumentModal = true;
  }
  async deleteMedicalDocument(documentId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete medical document?',
      message: 'This document will be removed from the patient record.',
      confirmText: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.healthRecordService.deleteMedicalDocument(this.patient._id, documentId).subscribe({
      next: () => {
        this.toast.success('Medical document deleted successfully');

        this.documentPage = this.getPageAfterDelete(this.documentMeta);

        this.loadHealthRecord(this.patient._id, false);
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
    this.medicalFileError = '';
  }
  saveMedicalDocument(): void {
    this.medicalFileError = this.getFileValidationError(
      this.selectedMedicalFile,
      !this.editingMedicalDocumentId,
      'Document file is required'
    );

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

        this.toast.error(
          this.getHttpErrorMessage(
            error,
            this.editingMedicalDocumentId ? 'Unable to update document' : 'Unable to add document'
          )
        );

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

  downloadCompleteRecord(): void {
    if (!this.patient?._id || this.isDownloadingRecord) {
      return;
    }

    this.isDownloadingRecord = true;

    this.healthRecordService
      .getHealthRecordDetails(this.patient._id, {
        timelinePage: 1,
        labPage: 1,
        documentPage: 1,
        limit: 10000
      })
      .subscribe({
        next: (response) => {
          const record = response.data;
          this.printCompleteHealthRecord(record);

          this.toast.success('Complete health record opened for PDF printing');
          this.isDownloadingRecord = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          this.toast.error('Unable to download complete health record');
          this.isDownloadingRecord = false;
          this.cdr.markForCheck();
        }
      });
  }

  private printCompleteHealthRecord(record: any): void {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');

    if (!printWindow) {
      this.toast.error('Please allow popups to print the health record');
      return;
    }

    const html = this.buildCompleteHealthRecordHtml(record);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    printWindow.location.href = url;

    printWindow.onload = () => {
      URL.revokeObjectURL(url);
      printWindow.focus();

      globalThis.setTimeout(() => {
        printWindow.print();
      }, 1200);
    };
  }

  private buildCompleteHealthRecordHtml(record: any): string {
    const patient = record.patient || {};
    const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient';
    const consultations = record.consultations || [];
    const labReports = record.labReports || [];
    const medicalDocuments = record.medicalDocuments || [];

    return `
      <!doctype html>
      <html>
        <head>
          <title>${this.escapeHtml(patient.patientId || 'patient')}-health-record</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 28px; font-family: Arial, sans-serif; color: #0f172a; background: #ffffff; }
            h1, h2, h3, p { margin-top: 0; }
            h1 { font-size: 28px; margin-bottom: 6px; }
            h2 { font-size: 20px; margin: 26px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
            h3 { font-size: 16px; margin-bottom: 8px; }
            .muted { color: #64748b; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
            .box, .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-top: 10px; break-inside: avoid; }
            .label { display: block; color: #64748b; font-size: 12px; margin-bottom: 3px; }
            .value { font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; font-size: 12px; }
            th { background: #f8fafc; }
            ul { margin: 6px 0 0; padding-left: 18px; }
            a { color: #2563eb; word-break: break-all; }
            .file-preview { max-width: 100%; max-height: 680px; margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 6px; object-fit: contain; }
            .file-frame { width: 100%; height: 980px; margin-top: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; }
            .file-page { break-before: page; margin-top: 18px; }
            .print-note { margin-top: 12px; padding: 10px; border-radius: 8px; background: #eff6ff; color: #1e40af; font-size: 12px; }
            @media print {
              body { padding: 18mm; }
              .card, .box { break-inside: avoid; }
              .file-card { break-inside: auto; }
              .file-page { break-before: page; }
              .file-frame { height: 245mm; border: none; border-radius: 0; }
              .file-preview { max-height: 245mm; border: none; }
              a { color: #0f172a; text-decoration: none; }
            }
          </style>
        </head>
        <body>
          <h1>${this.escapeHtml(fullName)}</h1>
          <p class="muted">Complete Health Record • Generated ${this.formatDisplayDate(new Date().toISOString())}</p>

          <section class="grid">
            ${this.infoBox('Patient ID', patient.patientId)}
            ${this.infoBox('Gender', patient.gender)}
            ${this.infoBox('Blood Group', patient.bloodGroup)}
            ${this.infoBox('Phone', patient.phone)}
            ${this.infoBox('Date of Birth', this.formatDisplayDate(patient.dateOfBirth))}
            ${this.infoBox('Allergies', patient.allergies)}
          </section>

          <section>
            <h2>Consultations & Prescriptions (${consultations.length})</h2>
            ${
              consultations.map((consultation: any) => this.renderConsultationForPrint(consultation)).join('') ||
              '<p class="muted">No consultations available.</p>'
            }
          </section>

          <section>
            <h2>Lab Reports (${labReports.length})</h2>
            ${
              labReports
                .map((report: any) => this.renderUploadedRecordForPrint(report, 'reportDate', 'reportType'))
                .join('') || '<p class="muted">No lab reports uploaded.</p>'
            }
          </section>

          <section>
            <h2>Medical Documents (${medicalDocuments.length})</h2>
            ${
              medicalDocuments
                .map((document: any) => this.renderUploadedRecordForPrint(document, 'recordDate', 'documentType'))
                .join('') || '<p class="muted">No medical documents uploaded.</p>'
            }
          </section>

          <p class="print-note">
            Uploaded images and PDFs are embedded in this print view. Other file types are included as download links.
          </p>
        </body>
      </html>
    `;
  }

  private renderConsultationForPrint(consultation: any): string {
    const prescriptions = consultation.prescriptions || [];

    return `
      <div class="card">
        <h3>${this.formatDisplayDate(consultation.createdAt)} • ${this.escapeHtml(consultation.doctorEmployeeId?.name || 'Doctor')}</h3>
        <p><strong>Diagnosis:</strong> ${this.escapeHtml(consultation.diagnosis)}</p>
        <p><strong>Symptoms:</strong> ${this.escapeHtml((consultation.symptoms || []).join(', '))}</p>
        <p><strong>Doctor Notes:</strong> ${this.escapeHtml(consultation.doctorNotes)}</p>
        ${
          prescriptions.length
            ? `
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  ${prescriptions
                    .map(
                      (item: any) => `
                        <tr>
                          <td>${this.escapeHtml(item.medicineName)}</td>
                          <td>${this.escapeHtml(item.dosage)}</td>
                          <td>${this.escapeHtml(item.frequency)}</td>
                          <td>${this.escapeHtml(item.duration)}</td>
                        </tr>
                      `
                    )
                    .join('')}
                </tbody>
              </table>
            `
            : '<p class="muted">No prescriptions recorded for this consultation.</p>'
        }
      </div>
    `;
  }

  private renderUploadedRecordForPrint(item: any, dateField: string, typeField: string): string {
    const fileUrl = this.getAbsoluteFileUrl(item.documentUrl);

    return `
      <div class="card file-card">
        <h3>${this.escapeHtml(item.title)}</h3>
        <p><strong>Type:</strong> ${this.escapeHtml(item[typeField])}</p>
        <p><strong>Date:</strong> ${this.formatDisplayDate(item[dateField])}</p>
        <p><strong>Doctor:</strong> ${this.escapeHtml(item.doctorName)}</p>
        <p><strong>Hospital/Lab:</strong> ${this.escapeHtml(item.hospitalName || item.labName)}</p>
        <p><strong>Notes:</strong> ${this.escapeHtml(item.notes)}</p>
        ${
          fileUrl
            ? `
              <p><strong>Uploaded File:</strong> <a href="${fileUrl}" target="_blank">${fileUrl}</a></p>
              ${this.renderPrintableUploadedFile(fileUrl, item.title)}
            `
            : '<p class="muted">No uploaded file attached.</p>'
        }
      </div>
    `;
  }

  private infoBox(label: string, value: any): string {
    return `
      <div class="box">
        <span class="label">${this.escapeHtml(label)}</span>
        <span class="value">${this.escapeHtml(value)}</span>
      </div>
    `;
  }

  private getAbsoluteFileUrl(path?: string): string {
    if (!path) {
      return '';
    }

    if (path.startsWith('http')) {
      return path;
    }

    return `http://localhost:5000/${path.replaceAll(/^\/+/g, '')}`;
  }

  private isPrintableImage(url: string): boolean {
    return /\.(png|jpe?g|gif|webp)$/i.test(url.split('?')[0]);
  }

  private isPrintablePdf(url: string): boolean {
    return /\.pdf$/i.test(url.split('?')[0]);
  }

  private renderPrintableUploadedFile(url: string, title: string): string {
    const safeUrl = this.escapeHtml(url);
    const safeTitle = this.escapeHtml(title);

    if (this.isPrintableImage(url)) {
      return `
        <div class="file-page">
          <img class="file-preview" src="${safeUrl}" alt="${safeTitle}" />
        </div>
      `;
    }

    if (this.isPrintablePdf(url)) {
      return `
        <div class="file-page">
          <iframe class="file-frame" src="${safeUrl}#toolbar=0&navpanes=0" title="${safeTitle}"></iframe>
          <object class="file-frame" data="${safeUrl}" type="application/pdf">
            <p class="muted">PDF preview could not be embedded. Open file: <a href="${safeUrl}" target="_blank">${safeUrl}</a></p>
          </object>
        </div>
      `;
    }

    return '<p class="muted">This uploaded file type cannot be embedded in the print view. Use the file link above.</p>';
  }

  private formatDisplayDate(value?: string): string {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  }

  private escapeHtml(value: any): string {
    return String(value ?? 'N/A')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
  onLabFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedLabFile = input.files?.[0] ?? null;
    this.labFileError = this.getFileValidationError(
      this.selectedLabFile,
      !this.editingLabReportId,
      'Report file is required'
    );

    if (this.labFileError && this.selectedLabFile) {
      this.selectedLabFile = null;
      input.value = '';
    }
  }
  onMedicalFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedMedicalFile = input.files?.[0] ?? null;
    this.medicalFileError = this.getFileValidationError(
      this.selectedMedicalFile,
      !this.editingMedicalDocumentId,
      'Document file is required'
    );

    if (this.medicalFileError && this.selectedMedicalFile) {
      this.selectedMedicalFile = null;
      input.value = '';
    }
  }

  private getFileValidationError(file: File | null, isRequired: boolean, requiredMessage: string): string {
    if (!file) {
      return isRequired ? requiredMessage : '';
    }

    if (file.size > this.maxUploadSizeBytes) {
      return `File size must not exceed ${this.maxUploadSizeLabel}`;
    }

    return '';
  }

  private getHttpErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.message || fallback;
  }

  private getPageAfterDelete(meta: any): number {
    const totalAfterDelete = Math.max((meta?.totalRecords || 0) - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(totalAfterDelete / this.pageSize), 1);

    return Math.min(meta?.page || 1, nextTotalPages);
  }

  private correctEmptyPagesAfterLoad(): boolean {
    if (this.timelinePage > 1 && !this.consultations.length) {
      this.timelinePage = Math.max(this.timelineMeta?.totalPages || 1, 1);
      this.loadHealthRecord(this.patient._id, false);
      return true;
    }

    if (this.labPage > 1 && !this.patient.labReports?.length) {
      this.labPage = Math.max(this.labMeta?.totalPages || 1, 1);
      this.loadHealthRecord(this.patient._id, false);
      return true;
    }

    if (this.documentPage > 1 && !this.patient.medicalDocuments?.length) {
      this.documentPage = Math.max(this.documentMeta?.totalPages || 1, 1);
      this.loadHealthRecord(this.patient._id, false);
      return true;
    }

    return false;
  }
  printPage(): void {
    globalThis.print();
  }
}
