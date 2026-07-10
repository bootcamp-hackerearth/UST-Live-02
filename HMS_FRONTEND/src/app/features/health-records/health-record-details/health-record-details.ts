import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
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

  readonly editingLabReportId = signal<string | null>(null);
  readonly editingMedicalDocumentId = signal<string | null>(null);
  readonly patient = signal<any>(null);
  readonly consultations = signal<any[]>([]);

  // expandedTimeline is a cache/map — left as plain property
  expandedTimeline: Record<string, boolean> = {};

  readonly isLoading = signal(true);
  readonly showLabReportModal = signal(false);
  readonly showMedicalDocumentModal = signal(false);

  selectedLabFile: File | null = null;
  labFileError = '';
  selectedMedicalFile: File | null = null;
  medicalFileError = '';

  readonly isUploadingLabReport = signal(false);
  readonly isUploadingDocument = signal(false);
  readonly isDownloadingRecord = signal(false);

  readonly timelinePage = signal(1);
  readonly labPage = signal(1);
  readonly documentPage = signal(1);

  readonly pageSize = 5;
  readonly maxUploadSizeBytes = 5 * 1024 * 1024;
  readonly maxUploadSizeLabel = '5 MB';

  readonly timelineMeta = signal<any>({});
  readonly labMeta = signal<any>({});
  readonly documentMeta = signal<any>({});

  readonly todayDate = this.formatDateInputValue(new Date());
  readonly canDeleteHealthRecordDocuments = ['SUPER_ADMIN', 'ADMIN'].includes(localStorage.getItem('role') || '');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly healthRecordService: HealthRecordService,
    private readonly consultationService: ConsultationService,
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
      this.isLoading.set(true);
    }

    const params = {
      timelinePage: this.timelinePage(),
      labPage: this.labPage(),
      documentPage: this.documentPage(),
      limit: this.pageSize
    };

    this.healthRecordService.getHealthRecordDetails(patientId, params).subscribe({
      next: (response) => {
        const patientData = response.data.patient;
        patientData.labReports = response.data.labReports ?? [];
        patientData.medicalDocuments = response.data.medicalDocuments ?? [];

        this.patient.set(patientData);
        this.consultations.set(response.data.consultations ?? []);

        this.timelineMeta.set(response.data.meta.consultations);
        this.labMeta.set(response.data.meta.labReports);
        this.documentMeta.set(response.data.meta.medicalDocuments);

        if (this.correctEmptyPagesAfterLoad()) {
          return;
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);

        this.isLoading.set(false);
      }
    });
  }

  toggleTimeline(consultationId: string): void {
    this.expandedTimeline[consultationId] = !this.expandedTimeline[consultationId];
  }

  /* Lab Report Modal */
  openLabModal(): void {
    this.editingLabReportId.set(null);

    this.labReportForm.reset();

    this.selectedLabFile = null;
    this.labFileError = '';

    this.showLabReportModal.set(true);
  }

  onTimelinePageChange(page: number): void {
    if (page < 1 || page > this.timelineMeta()?.totalPages) {
      return;
    }

    this.timelinePage.set(page);

    this.loadHealthRecord(this.patient()._id, false);
  }

  onLabPageChange(page: number): void {
    if (page < 1 || page > this.labMeta()?.totalPages) {
      return;
    }

    this.labPage.set(page);

    this.loadHealthRecord(this.patient()._id, false);
  }

  onDocumentPageChange(page: number): void {
    if (page < 1 || page > this.documentMeta()?.totalPages) {
      return;
    }

    this.documentPage.set(page);

    this.loadHealthRecord(this.patient()._id, false);
  }

  editLabReport(report: any): void {
    this.editingLabReportId.set(report._id);

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

    this.showLabReportModal.set(true);
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

    this.healthRecordService.deleteLabReport(this.patient()._id, reportId).subscribe({
      next: () => {
        this.toast.success('Lab report deleted successfully');

        this.labPage.set(this.getPageAfterDelete(this.labMeta()));

        this.loadHealthRecord(this.patient()._id, false);
      },
      error: (error) => {
        console.error(error);

        this.toast.error('Unable to delete lab report');
      }
    });
  }

  closeLabModal(): void {
    this.showLabReportModal.set(false);

    this.labReportForm.reset();

    this.selectedLabFile = null;
    this.labFileError = '';
  }

  saveLabReport(): void {
    this.labFileError = this.getFileValidationError(
      this.selectedLabFile,
      !this.editingLabReportId(),
      'Report file is required'
    );

    if (this.labReportForm.invalid || this.labFileError) {
      this.labReportForm.markAllAsTouched();
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

    this.isUploadingLabReport.set(true);

    const currentEditingId = this.editingLabReportId();
    const request$ = currentEditingId
      ? this.healthRecordService.updateLabReport(this.patient()._id, currentEditingId, formData)
      : this.healthRecordService.addLabReport(this.patient()._id, formData);

    request$.subscribe({
      next: () => {
        this.toast.success(
          currentEditingId ? 'Lab report updated successfully' : 'Lab report added successfully'
        );

        this.closeLabModal();

        this.isUploadingLabReport.set(false);

        this.loadHealthRecord(this.patient()._id);
      },
      error: (error) => {
        console.error(error);

        this.isUploadingLabReport.set(false);

        this.toast.error(
          this.getHttpErrorMessage(
            error,
            currentEditingId ? 'Unable to update lab report' : 'Unable to add lab report'
          )
        );
      }
    });
  }

  /* Medical Document Modal */
  openDocumentModal(): void {
    this.editingMedicalDocumentId.set(null);

    this.medicalDocumentForm.reset();

    this.selectedMedicalFile = null;
    this.medicalFileError = '';

    this.showMedicalDocumentModal.set(true);
  }

  editMedicalDocument(document: any): void {
    this.editingMedicalDocumentId.set(document._id);

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

    this.showMedicalDocumentModal.set(true);
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

    this.healthRecordService.deleteMedicalDocument(this.patient()._id, documentId).subscribe({
      next: () => {
        this.toast.success('Medical document deleted successfully');

        this.documentPage.set(this.getPageAfterDelete(this.documentMeta()));

        this.loadHealthRecord(this.patient()._id, false);
      },
      error: (error) => {
        console.error(error);

        this.toast.error('Unable to delete document');
      }
    });
  }

  closeDocumentModal(): void {
    this.showMedicalDocumentModal.set(false);

    this.medicalDocumentForm.reset();

    this.selectedMedicalFile = null;
    this.medicalFileError = '';
  }

  saveMedicalDocument(): void {
    this.medicalFileError = this.getFileValidationError(
      this.selectedMedicalFile,
      !this.editingMedicalDocumentId(),
      'Document file is required'
    );

    if (this.medicalDocumentForm.invalid || this.medicalFileError) {
      this.medicalDocumentForm.markAllAsTouched();
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

    this.isUploadingDocument.set(true);

    const currentEditingId = this.editingMedicalDocumentId();
    const request$ = currentEditingId
      ? this.healthRecordService.updateMedicalDocument(this.patient()._id, currentEditingId, formData)
      : this.healthRecordService.addMedicalDocument(this.patient()._id, formData);

    request$.subscribe({
      next: () => {
        this.toast.success(
          currentEditingId
            ? 'Medical document updated successfully'
            : 'Medical document added successfully'
        );

        this.closeDocumentModal();

        this.isUploadingDocument.set(false);

        this.loadHealthRecord(this.patient()._id);
      },
      error: (error) => {
        console.error(error);

        this.toast.error(
          this.getHttpErrorMessage(
            error,
            currentEditingId ? 'Unable to update document' : 'Unable to add document'
          )
        );

        this.isUploadingDocument.set(false);
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
    if (!this.patient()?._id || this.isDownloadingRecord()) {
      return;
    }

    this.isDownloadingRecord.set(true);

    this.healthRecordService
      .getHealthRecordDetails(this.patient()._id, {
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
          this.isDownloadingRecord.set(false);
        },
        error: (error) => {
          console.error(error);
          this.toast.error('Unable to download complete health record');
          this.isDownloadingRecord.set(false);
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
    const blobUrl = URL.createObjectURL(blob);

    printWindow.addEventListener('load', () => {
      URL.revokeObjectURL(blobUrl);
      printWindow.focus();
      printWindow.print();
    });
    printWindow.location.replace(blobUrl);
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
            .file-preview { max-width: 100%; max-height: 420px; margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 6px; }
            .print-note { margin-top: 12px; padding: 10px; border-radius: 8px; background: #eff6ff; color: #1e40af; font-size: 12px; }
            @media print {
              body { padding: 18mm; }
              .card, .box { break-inside: avoid; }
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
            Uploaded image files are printed inline when supported. PDF and other uploaded files are included as printable links.
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
    const imageHtml = fileUrl && this.isPrintableImage(fileUrl)
      ? `<img class="file-preview" src="${fileUrl}" alt="${this.escapeHtml(item.title)}" />`
      : '';

    return `
      <div class="card">
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
              ${imageHtml}
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

    return `http://localhost:5000/${path.replace(/^\/+/, '')}`;
  }

  private isPrintableImage(url: string): boolean {
    return /\.(png|jpe?g|gif|webp)$/i.test(url.split('?')[0]);
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
      !this.editingLabReportId(),
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
      !this.editingMedicalDocumentId(),
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
    const patientData = this.patient();

    if (this.timelinePage() > 1 && !this.consultations().length) {
      this.timelinePage.set(Math.max(this.timelineMeta()?.totalPages || 1, 1));
      this.loadHealthRecord(patientData._id, false);
      return true;
    }

    if (this.labPage() > 1 && !patientData.labReports?.length) {
      this.labPage.set(Math.max(this.labMeta()?.totalPages || 1, 1));
      this.loadHealthRecord(patientData._id, false);
      return true;
    }

    if (this.documentPage() > 1 && !patientData.medicalDocuments?.length) {
      this.documentPage.set(Math.max(this.documentMeta()?.totalPages || 1, 1));
      this.loadHealthRecord(patientData._id, false);
      return true;
    }

    return false;
  }

  printPage(): void {
    globalThis.print();
  }
}
