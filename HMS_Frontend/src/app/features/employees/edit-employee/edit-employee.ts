import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmployeeService } from '../../../core/services/employee';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-employee.html',
  styleUrl: './edit-employee.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditEmployee implements OnInit {
  employeeForm: FormGroup;

  employeeId = '';

  isSubmitting = false;

  errorMessage = '';

  successMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly employeeService: EmployeeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.employeeForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[A-Za-z ]+$/)]
      ],

      email: [
        {
          value: '',
          disabled: true
        }
      ],

      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],

      gender: ['', Validators.required],

      department: ['', Validators.required],

      designation: ['', Validators.required],

      joiningDate: ['', Validators.required]
    });
  }

  // Load employee details on page load
  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id') || '';

    this.loadEmployee();
  }

  // Fetch employee details
  loadEmployee(): void {
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (response: any) => {
        const employee = response.data;

        this.employeeForm.patchValue({
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          gender: employee.gender,
          department: employee.department,
          designation: employee.designation,
          joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : ''
        });

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(error);

        this.errorMessage = error?.error?.message || 'Failed to load employee';
        this.cdr.markForCheck();
      }
    });
  }

  // Update employee details
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const payload = {
      ...this.employeeForm.getRawValue()
    };

    delete payload.email;

    this.employeeService.updateEmployee(this.employeeId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.successMessage = 'Employee updated successfully';
        this.cdr.markForCheck();

        setTimeout(() => {
          this.router.navigate(['/employees']);
        }, 1000);
      },

      error: (error) => {
        console.error(error);

        this.isSubmitting = false;

        this.errorMessage = error?.error?.message || 'Failed to update employee';
        this.cdr.markForCheck();
      }
    });
  }
}
