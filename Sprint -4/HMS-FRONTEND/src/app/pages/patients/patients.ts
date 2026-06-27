import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { DatePipe } from '@angular/common';

import {
  Patient,
  CreatePatientPayload
} from '../../models/patients.model';

import { PatientService } from '../../services/patient.service';

import {
  patientValidators
} from '../../validations/patient.validation';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class Patients implements OnInit {
  patients = signal<Patient[]>([]);

  currentPage = signal(1);
  itemsPerPage = 8;
  searchText = signal('');

  totalRecords = signal(0);
  totalPages = signal(0);

  isEditMode = signal(false);

  selectedPatient =
    signal<Patient | null>(null);

  showAddPatientModal = signal(false);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  patientForm = new FormGroup({
    firstName: new FormControl(
      '',
      patientValidators.firstName
    ),

    lastName: new FormControl(
      '',
      patientValidators.lastName
    ),

    email: new FormControl(
      '',
      patientValidators.email
    ),

    phone: new FormControl(
      '',
      patientValidators.phone
    ),

    gender: new FormControl(
      '',
      patientValidators.gender
    ),

    dob: new FormControl(
      '',
      patientValidators.dob
    ),

    bloodGroup: new FormControl(
      '',
      patientValidators.bloodGroup
    ),

    address: new FormGroup({
      city: new FormControl(
        '',
        patientValidators.city
      ),

      state: new FormControl(
        '',
        patientValidators.state
      ),

      pincode: new FormControl(
        '',
        patientValidators.pincode
      )
    }),

    emergencyContactName: new FormControl(
      '',
      patientValidators.emergencyContactName
    ),

    emergencyContactPhone: new FormControl(
      '',
      patientValidators.emergencyContactPhone
    )
  });

  constructor(
    readonly patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.getPatients();
  }

  getPatients(): void {
    this.patientService
      .getAllPatients(
        this.currentPage(),
        this.itemsPerPage,
        this.searchText().trim()
      )
      .subscribe({
        next: (res) => {
          this.patients.set(res.data);
          this.totalRecords.set(
            res.pagination.totalRecords
          );
          this.totalPages.set(
            res.pagination.totalPages
          );

          console.log(
            'Patients:',
            this.patients()
          );

          console.log(
            'Pagination:',
            res.pagination
          );
        },

        error: (err) => {
          console.error(
            'Error fetching patients:',
            err
          );
        }
      });
  }

  startRecord(): number {
    if (this.totalRecords() === 0) {
      return 0;
    }

    return (
      (this.currentPage() - 1) *
        this.itemsPerPage +
      1
    );
  }

  endRecord(): number {
    const end =
      this.currentPage() *
      this.itemsPerPage;

    return Math.min(
      end,
      this.totalRecords()
    );
  }

  goToPreviousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.currentPage.update(
      (page) => page - 1
    );

    this.getPatients();
  }

  goToNextPage(): void {
    if (
      this.currentPage() >=
      this.totalPages()
    ) {
      return;
    }

    this.currentPage.update(
      (page) => page + 1
    );

    this.getPatients();
  }

  filterPatients(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.getPatients();
    }, 300);
  }

  openAddPatientModal(): void {
    this.patientForm.reset();

    document.body.classList.add(
      'modal-open'
    );

    this.patientForm.get('email')?.enable();
    this.showAddPatientModal.set(true);
    this.isEditMode.set(false);
    this.selectedPatient.set(null);
  }

  closeAddPatientModal(): void {
    this.showAddPatientModal.set(false);
    this.patientForm.reset();
    this.isEditMode.set(false);
    this.selectedPatient.set(null);
    document.body.classList.remove(
      'modal-open'
    );
  }

  openEditPatientModal(
    patient: Patient
  ): void {
    this.isEditMode.set(true);

    this.selectedPatient.set(
      patient
    );

    this.patientForm.get('email')?.disable();

    this.patientForm.patchValue({
      firstName:
        patient.firstName,

      lastName:
        patient.lastName,

      email:
        patient.email,

      phone:
        patient.phone,

      gender:
        patient.gender,

      dob:
        patient.dob
          ? patient.dob.split('T')[0]
          : '',

      bloodGroup:
        patient.bloodGroup,

      emergencyContactName:
        patient.emergencyContactName,

      emergencyContactPhone:
        patient.emergencyContactPhone,

      address: {
        city: patient.city,
        state: patient.state,
        pincode: patient.pincode
      }
    });
    console.log('Patient:', patient);

    document.body.classList.add(
      'modal-open'
    );

    this.showAddPatientModal.set(
      true
    );
  }

  deletePatient(patient: Patient): void {
  const confirmed = confirm(
    `Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`
  );

  if (!confirmed) {
    return;
  }

  this.patientService
    .deletePatient(patient.patientId)
    .subscribe({
      next: () => {
        alert('Patient deleted successfully!');

        if (
          this.patients().length === 1 &&
          this.currentPage() > 1
        ) {
          this.currentPage.update((page) => page - 1);
        }

        this.getPatients();
      },

      error: (err) => {
        console.error('Error deleting patient:', err);

        alert(
          err.error?.message ||
          'Unable to delete patient'
        );
      }
    });
}

  savePatient(): void {
  if (this.patientForm.invalid) {
  this.patientForm.markAllAsTouched();
  return;
  }

  const payload =
  this.patientForm.getRawValue();

  const selectedPatient =
  this.selectedPatient();

  if (
  this.isEditMode() &&
  selectedPatient
  ) {
  this.patientService
  .updatePatient(
  selectedPatient.patientId,
  payload
  )
  .subscribe({
  next: () => {
  alert(
  'Patient updated successfully!'
  );


        this.closeAddPatientModal();

        this.getPatients();
      },

      error: (err) => {
        console.error(
          'Error updating patient:',
          err
        );

        alert(
          err.error?.message ||
          'Something went wrong'
        );
      }
    });

  return;


  }

  this.patientService
  .createPatient(
  payload as CreatePatientPayload
  )
  .subscribe({
  next: (res) => {


      if (
        res.data.credentialsEmailSent
      ) {
        alert(
          'Patient created and login credentials emailed successfully!'
        );
      } else {
        alert(
          'Patient created, but login credentials could not be emailed.'
        );
      }

      this.closeAddPatientModal();

      this.currentPage.set(1);
      this.searchText.set('');

      this.getPatients();
    },

    error: (err) => {
      console.error(
        'Error creating patient:',
        err
      );

      alert(
        err.error?.message ||
        'Something went wrong'
      );
    }
  });


  }

}