import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import {
  DatePipe,
  NgClass
} from '@angular/common';

import {
  Doctor,
  CreateDoctorPayload,
  UpdateDoctorPayload
} from '../../models/doctor.model';

import {
  DoctorService
} from '../../services/doctor.service';

import {
  doctorValidators,
  getMaximumJoiningDate,
  getMinimumJoiningDate
} from '../../validations/doctor.validation';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    NgClass
  ],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors implements OnInit {
  doctors = signal<Doctor[]>([]);

  currentPage = signal(1);
  pageSize = 10;
  searchText = signal('');

  totalRecords = signal(0);
  totalPages = signal(0);

  showAddDoctorModal = signal(false);
  isEditMode = signal(false);

  selectedDoctor =
    signal<Doctor | null>(null);

  private searchTimer:
    ReturnType<typeof setTimeout> | null = null;

  departments = [
    'OPD',
    'IPD',
    'Lab',
    'Pharmacy',
    'Admin',
    'Front Office'
  ];

  designations = [
    'Jr Doctor'
  ];

  timeOptions = [
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM'
  ];

  doctorForm = new FormGroup(
    {
      firstName: new FormControl(
        '',
        doctorValidators.firstName
      ),

      lastName: new FormControl(
        '',
        doctorValidators.lastName
      ),

      email: new FormControl(
        '',
        doctorValidators.email
      ),

      password: new FormControl(
        '',
        doctorValidators.password
      ),

      phone: new FormControl(
        '',
        doctorValidators.phone
      ),

      department: new FormControl(
        '',
        doctorValidators.department
      ),

      designation: new FormControl(
        'Jr Doctor',
        doctorValidators.designation
      ),

      joiningDate: new FormControl(
        '',
        doctorValidators.joiningDate
      ),

      specialization: new FormControl(
        '',
        doctorValidators.specialization
      ),

      qualification: new FormControl(
        '',
        doctorValidators.qualification
      ),

      consultationFee:
        new FormControl<number | null>(
          null,
          doctorValidators.consultationFee
        ),

      medicalRegistrationNo:
        new FormControl(
          '',
          doctorValidators.medicalRegistrationNo
        ),

      availabilityStartTime:
        new FormControl(
          '',
          doctorValidators.availabilityStartTime
        ),

      availabilityEndTime:
        new FormControl(
          '',
          doctorValidators.availabilityEndTime
        ),

      experienceYears:
        new FormControl<number | null>(
          null,
          doctorValidators.experienceYears
        )
    },
    {
      validators:
        doctorValidators.availabilityTime
    }
  );

  constructor(
    readonly doctorService: DoctorService,
    readonly employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.getDoctors();
  }

  getTodayDate(): string {
    return getMinimumJoiningDate();
  }

  getMaxDate(): string {
    return getMaximumJoiningDate();
  }

  getDoctors(): void {
    this.doctorService
      .getAllDoctors(
        this.currentPage(),
        this.pageSize,
        this.searchText().trim()
      )
      .subscribe({
        next: (res) => {
          this.doctors.set(res.data);

          this.totalRecords.set(
            res.pagination.totalRecords
          );

          this.totalPages.set(
            res.pagination.totalPages
          );

          this.currentPage.set(
            res.pagination.page
          );
        },

        error: (err) => {
          console.error(
            'Error fetching doctors:',
            err
          );
        }
      });
  }

  get paginatedDoctors(): Doctor[] {
    return this.doctors();
  }

  get startRecord(): number {
    if (this.totalRecords() === 0) {
      return 0;
    }

    return (
      (this.currentPage() - 1) *
      this.pageSize +
      1
    );
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

    this.currentPage.update(
      (page) => page - 1
    );

    this.getDoctors();
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

    this.getDoctors();
  }

  filterDoctors(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.getDoctors();
    }, 300);
  }

  openAddDoctorModal(): void {
    this.isEditMode.set(false);
    this.selectedDoctor.set(null);

    this.doctorForm.reset({
      designation: 'Jr Doctor'
    });

    this.doctorForm
      .get('password')
      ?.setValidators(
        doctorValidators.password
      );

    this.doctorForm
      .get('password')
      ?.updateValueAndValidity();

    this.showAddDoctorModal.set(true);
  }

  private resolveSelectValue(
    value: string | null | undefined,
    options: string[]
  ): string {
    const cleanedValue = value?.trim();

    if (!cleanedValue) {
      return '';
    }

    const matchingOption = options.find(
      (option) =>
        option.trim().toLowerCase() ===
        cleanedValue.toLowerCase()
    );

    return matchingOption ?? cleanedValue;
  }

  openEditDoctorModal(
    doctor: Doctor
  ): void {
    this.isEditMode.set(true);
    this.selectedDoctor.set(doctor);

    const department =
      this.resolveSelectValue(
        doctor.department,
        this.departments
      );

    const designation =
      this.resolveSelectValue(
        doctor.designation,
        this.designations
      );

    if (
      department &&
      !this.departments.includes(department)
    ) {
      this.departments = [
        ...this.departments,
        department
      ];
    }

    if (
      designation &&
      !this.designations.includes(designation)
    ) {
      this.designations = [
        ...this.designations,
        designation
      ];
    }

    this.doctorForm.reset();

    this.doctorForm
      .get('password')
      ?.clearValidators();

    this.doctorForm
      .get('password')
      ?.updateValueAndValidity({
        emitEvent: false
      });

    this.doctorForm.patchValue({
      firstName:
        doctor.firstName ?? '',

      lastName:
        doctor.lastName ?? '',

      email:
        doctor.email ?? '',

      password: '',

      phone:
        doctor.phone ?? '',

      department,
      designation,

      joiningDate:
        doctor.joiningDate
          ? doctor.joiningDate.split('T')[0]
          : '',

      specialization:
        doctor.specialization ?? '',

      qualification:
        doctor.qualification ?? '',

      consultationFee:
        doctor.consultationFee ?? null,

      medicalRegistrationNo:
        doctor.medicalRegistrationNo ?? '',

      availabilityStartTime:
        doctor.availabilityStartTime ?? '',

      availabilityEndTime:
        doctor.availabilityEndTime ?? '',

      experienceYears:
        doctor.experienceYears ?? null
    });

    this.showAddDoctorModal.set(true);
  }

  closeAddDoctorModal(): void {
    this.showAddDoctorModal.set(false);
    this.isEditMode.set(false);
    this.selectedDoctor.set(null);

    this.doctorForm.reset({
      designation: 'Jr Doctor'
    });

    this.doctorForm
      .get('password')
      ?.setValidators(
        doctorValidators.password
      );

    this.doctorForm
      .get('password')
      ?.updateValueAndValidity();
  }
  deleteDoctor(doctor: Doctor): void {
    const confirmed = confirm(
      `Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    this.employeeService.deleteEmployee(doctor.employeeId).subscribe({
      next: () => {
        alert('Doctor deleted successfully');

        if (this.doctors().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((page) => page - 1);
        }

        this.getDoctors();
      },
      error: (err) => {
        alert(
          err.error?.message ||
          'Unable to delete doctor'
        );
      }
    });
  }
  saveDoctor(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    const selectedDoctor =
      this.selectedDoctor();

    if (
      this.isEditMode() &&
      selectedDoctor
    ) {
      const formValue =
        this.doctorForm.getRawValue();

      const payload: UpdateDoctorPayload = {
        firstName:
          formValue.firstName ?? undefined,

        lastName:
          formValue.lastName ?? undefined,

        email:
          formValue.email ?? undefined,

        phone:
          formValue.phone ?? undefined,

        department:
          formValue.department ?? undefined,

        designation:
          formValue.designation ?? undefined,

        joiningDate:
          formValue.joiningDate ?? undefined,

        status:
          selectedDoctor.status,

        specialization:
          formValue.specialization ?? undefined,

        qualification:
          formValue.qualification ?? undefined,

        consultationFee:
          formValue.consultationFee ?? undefined,

        medicalRegistrationNo:
          formValue.medicalRegistrationNo ??
          undefined,

        availabilityStartTime:
          formValue.availabilityStartTime ??
          undefined,

        availabilityEndTime:
          formValue.availabilityEndTime ??
          undefined,

        experienceYears:
          formValue.experienceYears ?? undefined
      };

      this.doctorService
        .updateDoctor(
          selectedDoctor.doctorId,
          payload
        )
        .subscribe({
          next: () => {
            alert(
              'Doctor updated successfully!'
            );

            this.closeAddDoctorModal();
            this.getDoctors();
          },

          error: (err) => {
            console.error(
              'Full error:',
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

    const payload =
      this.doctorForm
        .getRawValue() as CreateDoctorPayload;

    this.doctorService
      .createDoctor(payload)
      .subscribe({
        next: () => {
          alert(
            'Doctor created successfully!'
          );

          this.closeAddDoctorModal();

          this.currentPage.set(1);
          this.searchText.set('');

          this.getDoctors();
        },

        error: (err) => {
          alert(
            err.error?.message ||
            'Something went wrong'
          );
        }
      });
  }
}