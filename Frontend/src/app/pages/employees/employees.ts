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
  EmployeeService
} from '../../services/employee.service';

import {
  Employee
} from '../../models/employee.model';

import {
  employeeValidators,
  getMaximumEmployeeJoiningDate,
  getMinimumEmployeeJoiningDate
} from '../../validations/employee.validation';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    NgClass
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {
  employees = signal<Employee[]>([]);

  searchText = signal('');
  showAddEmployeeModal = signal(false);

  currentPage = signal(1);
  pageSize = 10;

  totalRecords = signal(0);
  totalPages = signal(0);

  isEditMode = signal(false);

  selectedEmployee =
    signal<Employee | null>(null);

  loggedInUserRole: string | null = null;
  loggedInUserId: string | null = null;

  private searchTimer:
    ReturnType<typeof setTimeout> | null = null;

  employeeForm = new FormGroup({
    firstName: new FormControl(
      '',
      employeeValidators.firstName
    ),

    lastName: new FormControl(
      '',
      employeeValidators.lastName
    ),

    email: new FormControl(
      '',
      employeeValidators.email
    ),

    password: new FormControl(
      '',
      employeeValidators.password
    ),

    phone: new FormControl(
      '',
      employeeValidators.phone
    ),

    role: new FormControl(
      '',
      employeeValidators.role
    ),

    department: new FormControl(
      '',
      employeeValidators.department
    ),

    designation: new FormControl(
      '',
      employeeValidators.designation
    ),

    joiningDate: new FormControl(
      '',
      employeeValidators.joiningDate
    )
  });

  constructor(
    readonly employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');

    if (user) {
      const parsedUser = JSON.parse(user);

      this.loggedInUserId = parsedUser.id;
      this.loggedInUserRole = parsedUser.roleId?.name;
    }

    this.getEmployees();
  }

  getTodayDate(): string {
    return getMinimumEmployeeJoiningDate();
  }

  getMaxDate(): string {
    return getMaximumEmployeeJoiningDate();
  }

  getEmployees(): void {
    this.employeeService
      .getAllEmployees(
        this.currentPage(),
        this.pageSize,
        this.searchText().trim()
      )
      .subscribe({
        next: (res) => {
          console.log('Employee API Response:', res);
          this.employees.set(res.data);

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
            'Error fetching employees:',
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
      this.pageSize +
      1
    );
  }

  endRecord(): number {
    const end =
      this.currentPage() *
      this.pageSize;

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

    this.getEmployees();
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

    this.getEmployees();
  }

  filterEmployees(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.getEmployees();
    }, 300);
  }

  openAddEmployeeModal(): void {
    this.isEditMode.set(false);
    this.selectedEmployee.set(null);

    this.employeeForm.reset();

    this.employeeForm
      .get('password')
      ?.setValidators(
        employeeValidators.password
      );

    this.employeeForm
      .get('password')
      ?.updateValueAndValidity();

    this.employeeForm
      .get('role')
      ?.enable();

    this.showAddEmployeeModal.set(true);
  }

  openEditEmployeeModal(
    employee: Employee
  ): void {
    this.isEditMode.set(true);
    this.selectedEmployee.set(employee);

    this.employeeForm.reset();

    this.employeeForm
      .get('password')
      ?.clearValidators();

    this.employeeForm
      .get('password')
      ?.updateValueAndValidity({
        emitEvent: false
      });

    this.employeeForm.patchValue({
      firstName:
        employee.firstName ?? '',

      lastName:
        employee.lastName ?? '',

      email:
        employee.email ?? '',

      password: '',

      phone:
        employee.phone ?? '',

      role:
        employee.role ?? '',

      department:
        employee.department ?? '',

      designation:
        employee.designation ?? '',

      joiningDate:
        employee.joiningDate
          ? employee.joiningDate.split('T')[0]
          : ''
    });

    this.employeeForm
      .get('role')
      ?.disable();

    this.showAddEmployeeModal.set(true);
  }

  closeAddEmployeeModal(): void {
    this.showAddEmployeeModal.set(false);
    this.isEditMode.set(false);
    this.selectedEmployee.set(null);

    this.employeeForm.reset();

    this.employeeForm
      .get('role')
      ?.enable();

    this.employeeForm
      .get('password')
      ?.setValidators(
        employeeValidators.password
      );

    this.employeeForm
      .get('password')
      ?.updateValueAndValidity();
  }

  saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const selectedEmployee =
      this.selectedEmployee();

    if (
      this.isEditMode() &&
      selectedEmployee
    ) {
      const formValue =
        this.employeeForm.getRawValue();

      const payload = {
        firstName:
          formValue.firstName,

        lastName:
          formValue.lastName,

        email:
          formValue.email,

        phone:
          formValue.phone,

        department:
          formValue.department,

        designation:
          formValue.designation,

        joiningDate:
          formValue.joiningDate,

        status:
          selectedEmployee.status
      };

      this.employeeService
        .updateEmployee(
          selectedEmployee.employeeId,
          payload as any
        )
        .subscribe({
          next: () => {
            alert(
              'Employee updated successfully!'
            );

            this.closeAddEmployeeModal();
            this.getEmployees();
          },

          error: (err) => {
            console.error(
              'Error updating employee:',
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
      this.employeeForm.getRawValue();

    this.employeeService
      .createEmployee(payload as any)
      .subscribe({
        next: () => {
          alert(
            'Employee created successfully!'
          );

          this.closeAddEmployeeModal();

          this.currentPage.set(1);
          this.searchText.set('');

          this.getEmployees();
        },

        error: (err) => {
          console.error(
            'Error creating employee:',
            err
          );

          alert(
            err.error?.message ||
            'Something went wrong'
          );
        }
      });
  }

  deleteEmployee(employee: Employee): void {
    const confirmed = confirm(
      `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    this.employeeService
      .deleteEmployee(employee.employeeId)
      .subscribe({
        next: () => {
          alert('Employee deleted successfully!');

          if (
            this.employees().length === 1 &&
            this.currentPage() > 1
          ) {
            this.currentPage.update((page) => page - 1);
          }

          this.getEmployees();
        },

        error: (err) => {
          console.error(
            'Error deleting employee:',
            err
          );

          alert(
            err.error?.message ||
            'Unable to delete employee'
          );
        }
      });
  }
}