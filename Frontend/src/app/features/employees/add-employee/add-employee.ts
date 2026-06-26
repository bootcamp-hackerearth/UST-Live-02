import { Component, ChangeDetectorRef, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ToastService } from '../../../core/services/toast';
import { EmployeeService } from '../../../core/services/employee';
import { AuthService } from '../../../core/services/auth';
import { getApiErrorMessage } from '../../../core/utils/api-error';

type DesignationOption = {
  label: string;
  value: string;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css'
})
export class AddEmployee implements OnInit, OnDestroy {
  employeeForm: FormGroup;

  successMessage = '';
  errorMessage = '';

  isSubmitting = false;
  designationOptions: DesignationOption[] = [];

  private readonly staffDesignationOptions: DesignationOption[] = [
    { label: 'Doctor', value: 'DOCTOR' },
    { label: 'Nurse', value: 'NURSE' },
    { label: 'Receptionist', value: 'RECEPTIONIST' }
  ];
  private userSubscription?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService
  ) {
    this.employeeForm = this.fb.group({
      // Basic Details
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]
      ],

      email: ['', [Validators.required, Validators.email]],

      countryCode: ['+91', Validators.required],

      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

      gender: ['', Validators.required],

      designation: ['', Validators.required],

      department: ['', Validators.required],

      joiningDate: ['', Validators.required],

      // Doctor Details
      medicalRegistrationNo: [
        '',
        [
          Validators.minLength(5),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9\-/]+$/)
        ]
      ],

      specialization: [''],

      qualification: [
        '',
        [
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[A-Za-z\s.,]+$/)
        ]
      ],

      consultationFee: [0, [Validators.min(0)]],

      availabilitySlots: [''],

      // Doctor Availability
      workingDays: [[]],

      startTime: [''],

      endTime: [''],

      slotDuration: [15],

      breakStartTime: [''],

      breakEndTime: [''],

      maxPatientsPerDay: [40]
    });

    // Apply doctor-specific validators dynamically
    this.employeeForm.get('designation')?.valueChanges.subscribe((designation) => {
      const doctorFields = [
        'medicalRegistrationNo',
        'specialization',
        'qualification',
        'consultationFee',
        'startTime',
        'endTime',
        'slotDuration'
      ];

      if (designation === 'DOCTOR') {
        this.employeeForm.get('medicalRegistrationNo')?.setValidators([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9\-/]+$/)
        ]);

        this.employeeForm.get('qualification')?.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[A-Za-z\s.,]+$/)
        ]);

        this.employeeForm.get('specialization')?.setValidators([
          Validators.required
        ]);

        this.employeeForm.get('consultationFee')?.setValidators([
          Validators.required,
          Validators.min(0)
        ]);

        this.employeeForm.get('startTime')?.setValidators([
          Validators.required
        ]);

        this.employeeForm.get('endTime')?.setValidators([
          Validators.required
        ]);

        this.employeeForm.get('slotDuration')?.setValidators([
          Validators.required
        ]);

        doctorFields.forEach((field) => {
          this.employeeForm.get(field)?.updateValueAndValidity();
        });
      } else {
        doctorFields.forEach((field) => {
          this.employeeForm.get(field)?.clearValidators();
          this.employeeForm.get(field)?.updateValueAndValidity();
        });
      }
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((user) => {
      this.setDesignationOptions(user);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  private setDesignationOptions(user: any): void {
    const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

    this.designationOptions = isSuperAdmin
      ? [
          { label: 'Admin', value: 'ADMIN' },
          ...this.staffDesignationOptions
        ]
      : this.staffDesignationOptions;
  }

  // Current selected designation
  get designation(): string {
    return this.employeeForm.get('designation')?.value;
  }

  // Submit employee form
  onSubmit(): void {

    Object.keys(this.employeeForm.controls).forEach((key) => {
      const control = this.employeeForm.get(key);

      if (control?.invalid) {
      }
    });


    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.successMessage = '';
    this.errorMessage = '';

    // Remove doctor-specific values for non-doctors
    if (this.designation !== 'DOCTOR') {
      this.employeeForm.patchValue({
        medicalRegistrationNo: '',
        specialization: '',
        qualification: '',
        consultationFee: 0,
        availabilitySlots: '',
        workingDays: [],
        startTime: '',
        endTime: '',
        breakStartTime: '',
        breakEndTime: ''
      });
    }

    // Prepare API payload
    const payload: any = {
      ...this.employeeForm.value,
      qualification: this.employeeForm.value.qualification
        ? [this.employeeForm.value.qualification]
        : [],
      role: this.employeeForm.value.designation
    };

    if (this.designation !== 'DOCTOR') {
      delete payload.medicalRegistrationNo;
      delete payload.specialization;
      delete payload.qualification;
      delete payload.consultationFee;
      delete payload.availabilitySlots;
      delete payload.workingDays;
      delete payload.startTime;
      delete payload.endTime;
      delete payload.slotDuration;
      delete payload.breakStartTime;
      delete payload.breakEndTime;
      delete payload.maxPatientsPerDay;
    }

    // Create employee
    this.employeeService.createEmployee(payload).subscribe({
      next: (response) => {

        this.isSubmitting = false;

        this.toastService.show(
          'Employee created successfully',
          'success'
        );

        this.cdr.detectChanges();

        this.employeeForm.reset();

        this.employeeForm.patchValue({
          countryCode: '+91',
          designation: ''
        });
      },

      error: (error) => {



        this.isSubmitting = false;

        this.toastService.show(
          getApiErrorMessage(error, 'Failed to create employee'),
          'error'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // Handle working day checkbox selection
  onWorkingDayChange(event: any): void {
    const workingDays =
      this.employeeForm.get('workingDays')?.value || [];

    if (event.target.checked) {
      workingDays.push(event.target.value);
    } else {
      const index = workingDays.indexOf(event.target.value);

      if (index > -1) {
        workingDays.splice(index, 1);
      }
    }

    this.employeeForm.get('workingDays')?.setValue(workingDays);
  }
}
