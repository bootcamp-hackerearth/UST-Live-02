import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';

import {
  appointmentDetailsValidators
} from '../../../validations/appointment-details.validation';
import { AppointmentService } from '../../../services/appointments.service';
import { HealthRecordService } from '../../../services/health-record.service';

import {
  AppointmentDetails as AppointmentDetailsModel,
  AppointmentDetailsResponse
} from '../../../models/appointment-details.model';

import {
  CreateHealthRecordRequest,
  HealthRecord,
  PrescriptionMedicine,
  UpdateHealthRecordRequest
} from '../../../models/health-record.model';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.css'
})
export class AppointmentDetails implements OnInit {
  appointmentId = '';
  returnTo = '';
  loading = signal(false);
  saving = signal(false);
  finalizing = signal(false);

  appointment = signal<AppointmentDetailsModel | null>(null);
  healthRecord = signal<HealthRecord | null>(null);

  isModalOpen = signal(false);
  isEditMode = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  roleCode =
    localStorage.getItem('rolecode') ||
    localStorage.getItem('roleCode') ||
    localStorage.getItem('role')||

    '';

  healthRecordForm!: FormGroup;

  constructor(
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly fb: FormBuilder,
    readonly appointmentService: AppointmentService,
    readonly healthRecordService: HealthRecordService
  ) {
    this.healthRecordForm = this.fb.group({
      diagnosis: [
        '',
        appointmentDetailsValidators.diagnosis
      ],
      prescription: this.fb.array([]),
      notes: ['']
    });
  }

ngOnInit(): void {
  this.appointmentId = this.route.snapshot.paramMap.get('id') || '';

  this.returnTo =
    this.route.snapshot.queryParamMap.get('returnTo') || '';

  this.addMedicine();

  if (this.appointmentId) {
    this.loadAppointmentDetails();
  }
}

  get prescription(): FormArray {
    return this.healthRecordForm.get('prescription') as FormArray;
  }

  createMedicineGroup(data?: PrescriptionMedicine): FormGroup {
    return this.fb.group({
      name: [
        data?.name || '',
        appointmentDetailsValidators.medicineName
      ],

      dosage: [
        data?.dosage || '',
        appointmentDetailsValidators.dosage
      ],

      duration: [
        data?.duration || '',
        appointmentDetailsValidators.duration
      ],

      notes: [
        data?.notes || ''
      ]
    });
  }

  addMedicine(): void {
    this.prescription.push(this.createMedicineGroup());
  }

  removeMedicine(index: number): void {
    if (this.prescription.length > 1) {
      this.prescription.removeAt(index);
    }
  }

  loadAppointmentDetails(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.appointmentService.getAppointmentDetails(this.appointmentId).subscribe({
      next: (res: AppointmentDetailsResponse) => {
        this.appointment.set(res.data.appointment);
        this.healthRecord.set(res.data.healthRecord);
        this.loading.set(false);
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage.set(
          error?.error?.message || 'Unable to load appointment details'
        );
        this.loading.set(false);
      }
    });
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.healthRecordForm.reset({
      diagnosis: '',
      notes: ''
    });

    this.prescription.clear();
    this.addMedicine();

    this.isModalOpen.set(true);
  }

  openEditModal(): void {
    const record = this.healthRecord();

    if (!record || record.status === 'FINALIZED') {
      return;
    }

    this.isEditMode.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.healthRecordForm.patchValue({
      diagnosis: record.diagnosis || '',
      notes: record.notes || ''
    });

    this.prescription.clear();

    if (record.prescription?.length) {
      record.prescription.forEach((medicine: PrescriptionMedicine) => {
        this.prescription.push(this.createMedicineGroup(medicine));
      });
    } else {
      this.addMedicine();
    }

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveDraft(): void {
    if (this.healthRecordForm.invalid) {
      this.healthRecordForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.healthRecordForm.value;

    const updatePayload: UpdateHealthRecordRequest = {
      diagnosis: formValue.diagnosis,
      prescription: formValue.prescription,
      notes: formValue.notes
    };

    if (this.isEditMode() && this.healthRecord()?._id) {
      this.healthRecordService
        .updateHealthRecord(this.healthRecord()!._id, updatePayload)
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.isModalOpen.set(false);
            this.successMessage.set('Health record draft updated successfully');
            this.loadAppointmentDetails();
          },
          error: (error: { error?: { message?: string } }) => {
            this.saving.set(false);
            this.errorMessage.set(
              error?.error?.message || 'Unable to update health record'
            );
          }
        });

      return;
    }

    const createPayload: CreateHealthRecordRequest = {
      appointmentId: this.appointmentId,
      ...updatePayload
    };

    this.healthRecordService.createHealthRecord(createPayload).subscribe({
      next: () => {
        this.saving.set(false);
        this.isModalOpen.set(false);
        this.successMessage.set('Health record draft saved successfully');
        this.loadAppointmentDetails();
      },
      error: (error: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Unable to save health record'
        );
      }
    });
  }

  finalizeRecord(): void {
    const record = this.healthRecord();

    if (!record?._id) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to finalize this health record? Once finalized, it cannot be edited.'
    );

    if (!confirmed) {
      return;
    }

    this.finalizing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.healthRecordService.finalizeHealthRecord(record._id).subscribe({
      next: () => {
        this.finalizing.set(false);
        this.successMessage.set('Health record finalized successfully');
        this.loadAppointmentDetails();
      },
      error: (error: { error?: { message?: string } }) => {
        this.finalizing.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Unable to finalize health record'
        );
      }
    });
  }

goBack(): void {
  const basePath = localStorage.getItem('basePath') || '/admin';

  if (this.returnTo === 'health-records') {
    this.router.navigate([`${basePath}/health-records`]);
    return;
  }

  this.router.navigate([`${basePath}/appointments`]);
}
  canAddHealthRecord(): boolean {
    return !this.healthRecord() && this.appointment()?.status === 'BOOKED';
  }

  canEditDraft(): boolean {
    return this.healthRecord()?.status === 'DRAFT';
  }

  canFinalize(): boolean {
    return (this.roleCode === 'DOC'|| this.roleCode==='Doctor') && this.healthRecord()?.status === 'DRAFT';
  }
}