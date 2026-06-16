import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiErrorHandlerService } from '../../../core/services/api-error-handler.service';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { Appointment } from '../../../core/models/appointment.model';
import {
  MedicalRecord,
  MedicalRecordStatus,
} from '../../../core/models/medical-record.model';

// Create / edit dialog for a medical record. Doctors may finalize; staff are
// locked to DRAFT (the status field is read-only and the payload always sends DRAFT).
@Component({
  selector: 'app-medical-record-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medical-record-form-dialog.html',
  styleUrl: './medical-record-form-dialog.css',
})
export class MedicalRecordFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly apiError = inject(ApiErrorHandlerService);
  private readonly service = inject(MedicalRecordService);

  // Appointment context (provides the read-only auto-filled fields)
  @Input({ required: true }) appointment!: Appointment;
  // When set, the dialog edits an existing DRAFT; otherwise it creates a new record
  @Input() existingRecord: MedicalRecord | null = null;

  @Output() saved = new EventEmitter<MedicalRecord>();
  @Output() closed = new EventEmitter<void>();

  saving = signal(false);

  isDoctor = computed(() => this.auth.getDesignation() === 'DOCTOR');

  // Mirror of the status control so the primary button label stays reactive
  private statusSig = signal<MedicalRecordStatus>('DRAFT');

  form!: FormGroup;

  // Read-only auto-filled values
  get patientUHID(): string {
    return (
      this.existingRecord?.patientUHID ||
      this.appointment.patient?.UHID ||
      this.appointment.patientId
    );
  }
  get patientName(): string {
    return (
      this.existingRecord?.patientName ||
      this.appointment.patient?.name ||
      this.appointment.patientId
    );
  }
  get doctorEmployeeId(): string {
    return (
      this.existingRecord?.doctorEmployeeId || this.appointment.doctorEmployeeId
    );
  }
  get doctorName(): string {
    return (
      this.existingRecord?.doctorName ||
      this.appointment.doctor?.name ||
      this.appointment.doctorEmployeeId
    );
  }
  get appointmentId(): string {
    return this.appointment.appointmentId;
  }

  ngOnInit(): void {
    const r = this.existingRecord;
    this.form = this.fb.group({
      symptoms: [r?.symptoms ?? '', [Validators.required]],
      diagnosis: [r?.diagnosis ?? '', [Validators.required]],
      notes: [r?.notes ?? ''],
      status: [(r?.status as MedicalRecordStatus) ?? 'DRAFT'],
      prescriptionItems: this.fb.array(
        (r?.prescriptionItems ?? []).map((item) => this.newItem(item)),
      ),
    });

    // Keep the status signal in sync so primaryLabel() recomputes on change
    this.statusSig.set(this.form.get('status')!.value as MedicalRecordStatus);
    this.form
      .get('status')!
      .valueChanges.subscribe((v) =>
        this.statusSig.set(v as MedicalRecordStatus),
      );
  }

  get prescriptionItems(): FormArray {
    return this.form.get('prescriptionItems') as FormArray;
  }

  private newItem(value?: { name: string; dosage: string; duration: string }) {
    return this.fb.group({
      name: [value?.name ?? '', [Validators.required]],
      dosage: [value?.dosage ?? '', [Validators.required]],
      duration: [value?.duration ?? '', [Validators.required]],
    });
  }

  addItem(): void {
    this.prescriptionItems.push(this.newItem());
  }

  removeItem(index: number): void {
    this.prescriptionItems.removeAt(index);
  }

  // Primary button label adapts to role / edit-state / chosen status
  primaryLabel = computed(() => {
    const editing = !!this.existingRecord;
    if (!this.isDoctor()) {
      return editing ? 'Update Draft' : 'Generate Medical Record';
    }
    const finalizing = this.statusSig() === 'FINALIZED';
    if (editing) {
      return finalizing ? 'Verify & Finalize' : 'Update Draft';
    }
    return finalizing ? 'Create & Finalize' : 'Create Draft';
  });

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Staff are always DRAFT; doctors honour the status dropdown
    const status: MedicalRecordStatus = this.isDoctor()
      ? this.form.value.status
      : 'DRAFT';

    const payload = {
      symptoms: this.form.value.symptoms,
      diagnosis: this.form.value.diagnosis,
      notes: this.form.value.notes,
      prescriptionItems: this.prescriptionItems.value,
      status,
    };

    this.saving.set(true);

    const request$ = this.existingRecord
      ? this.service.update(this.existingRecord.medicalRecordId, payload)
      : this.service.create({
          appointmentId: this.appointmentId,
          ...payload,
        });

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.toast.success(res.message || 'Medical record saved.');
        if (res.data.medicalRecord) {
          this.saved.emit(res.data.medicalRecord);
        } else {
          this.closed.emit();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(
          this.apiError.message(err, 'Failed to save medical record.'),
        );
      },
    });
  }
}
