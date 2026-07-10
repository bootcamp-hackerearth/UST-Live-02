import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast';
import { EmployeeService } from '../../../core/services/employee';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEmployee implements OnInit {
  employeeForm: FormGroup;

  readonly isSubmitting = signal(false);
  readonly designations = signal(['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'LAB_TECH', 'PHARMACIST', 'CASHIER']);

  ngOnInit(): void {
    const role = localStorage.getItem('role');

    if (role !== 'SUPER_ADMIN') {
      this.designations.update(list => list.filter((designation) => designation !== 'ADMIN'));
    }
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly toastService: ToastService
  ) {
    this.employeeForm = this.fb.group({
      // Basic Details
      name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[A-Za-z\s]+$/)]
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
        [Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/^[A-Za-z0-9\-/]+$/)]
      ],
      specialization: [''],
      qualification: [
        '',
        [Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[A-Za-z0-9\s.,()-]+$/)]
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
        this.employeeForm
          .get('medicalRegistrationNo')
          ?.setValidators([
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(50),
            Validators.pattern(/^[A-Za-z0-9\-/]+$/)
          ]);

        this.employeeForm
          .get('qualification')
          ?.setValidators([
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            Validators.pattern(/^[A-Za-z0-9\s.,()-]+$/)
          ]);

        this.employeeForm.get('specialization')?.setValidators([Validators.required]);

        this.employeeForm.get('consultationFee')?.setValidators([Validators.required, Validators.min(0)]);

        this.employeeForm.get('startTime')?.setValidators([Validators.required]);

        this.employeeForm.get('endTime')?.setValidators([Validators.required]);

        this.employeeForm.get('slotDuration')?.setValidators([Validators.required]);

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

  // Current selected designation
  get designation(): string {
    return this.employeeForm.get('designation')?.value;
  }

  // Submit employee form
  onSubmit(): void {
    console.log('FORM VALID:', this.employeeForm.valid);

    Object.keys(this.employeeForm.controls).forEach((key) => {
      const control = this.employeeForm.get(key);

      if (control?.invalid) {
        console.log(key, control.errors);
      }
    });

    console.log('Create Employee Clicked');
    console.log(this.employeeForm.value);

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      return;
    }

    this.isSubmitting.set(true);

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
      qualification: this.employeeForm.value.qualification ? [this.employeeForm.value.qualification] : []
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
        console.log(response);

        this.isSubmitting.set(false);

        this.toastService.show('Employee created successfully', 'success');

        this.employeeForm.reset();

        this.employeeForm.patchValue({
          countryCode: '+91',
          designation: ''
        });
      },
      error: (error) => {
        console.log('FULL ERROR');
        console.log(error);

        console.log('BACKEND RESPONSE');
        console.log(error?.error);

        console.log('VALIDATION');
        console.log(error?.error?.errors);

        this.isSubmitting.set(false);

        this.toastService.show(error?.error?.message || 'Failed to create employee', 'error');
      }
    });
  }

  // Handle working day checkbox selection
  onWorkingDayChange(event: any): void {
    const workingDays = this.employeeForm.get('workingDays')?.value || [];

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
