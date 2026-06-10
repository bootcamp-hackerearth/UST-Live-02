import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchText = '';
  showAddEmployeeModal = false;
  currentPage = 1;
  pageSize = 10;
  isEditMode = false;
  selectedEmployee: Employee | null = null;
  loggedInUserId: string | null = null;

 
  employeeForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^(?!\s+$)[A-Za-z\s]+$/)
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.pattern(/^(?!\s+$)[A-Za-z\s]+$/)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$')
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('^[6-9][0-9]{9}$')
    ]),
    role: new FormControl('', [
      Validators.required
    ]),
    department: new FormControl('', [
      Validators.required
    ]),
    designation: new FormControl('', [
      Validators.required
    ]),
    joiningDate: new FormControl('', [
      Validators.required
    ])
  });

  constructor(
    readonly employeeService: EmployeeService,
    readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getEmployees();
  }

  get paginatedEmployees(): Employee[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return this.filteredEmployees.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEmployees.length / this.pageSize);
  }

  get startRecord(): number {
    if (this.filteredEmployees.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredEmployees.length
    );
  }
 
 
 

  getEmployees() {
    this.employeeService.getAllEmployees()
      .subscribe({
        next: (res) => {
          this.employees = res.data;
          this.filteredEmployees = res.data;
          console.log('Employees:', this.employees);
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
        }
      });
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

 
 
 

  filterEmployees() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    this.filteredEmployees = this.employees.filter(employee =>
      employee.employeeCode?.toLowerCase().includes(search) ||
      employee.firstName?.toLowerCase().includes(search) ||
      employee.lastName?.toLowerCase().includes(search) ||
      employee.email?.toLowerCase().includes(search) ||
      employee.phone?.includes(search) ||
      employee.role?.toLowerCase().includes(search) ||
      employee.department?.toLowerCase().includes(search) ||
      employee.designation?.toLowerCase().includes(search)
    );
    this.currentPage = 1;
  }

 
 
 
  openAddEmployeeModal() {
    this.isEditMode = false;
    this.selectedEmployee = null;

    this.employeeForm.reset();

    this.employeeForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$')
    ]);
    this.employeeForm.get('password')?.updateValueAndValidity();

    this.showAddEmployeeModal = true;
  }

  openEditEmployeeModal(employee: Employee) {
    this.isEditMode = true;
    this.selectedEmployee = employee;

    this.employeeForm.reset();

    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      password: '',
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : ''
    });

    this.employeeForm.get('password')?.clearValidators();
    this.employeeForm.get('password')?.updateValueAndValidity();

    this.employeeForm.get('role')?.disable();

    this.showAddEmployeeModal = true;
  }
  closeAddEmployeeModal() {
    this.showAddEmployeeModal = false;
    this.isEditMode = false;
    this.selectedEmployee = null;

    this.employeeForm.reset();

    this.employeeForm.get('role')?.enable();
    this.employeeForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$')
    ]);
    this.employeeForm.get('password')?.updateValueAndValidity();
  }

 
 
 

 saveEmployee() {
  if (this.employeeForm.invalid) {
    this.employeeForm.markAllAsTouched();
    return;
  }

  if (this.isEditMode && this.selectedEmployee) {
    const payload = {
      firstName: this.employeeForm.get('firstName')?.value,
      lastName: this.employeeForm.get('lastName')?.value,
      email: this.employeeForm.get('email')?.value,
      phone: this.employeeForm.get('phone')?.value,
      department: this.employeeForm.get('department')?.value,
      designation: this.employeeForm.get('designation')?.value,
      joiningDate: this.employeeForm.get('joiningDate')?.value,
      status: this.selectedEmployee.status
    };

    this.employeeService.updateEmployee(
      this.selectedEmployee.employeeId,
      payload as any
    ).subscribe({
      next: (res) => {
        console.log('Employee updated successfully:', res);
        alert('Employee updated successfully!');
        this.closeAddEmployeeModal();
        this.getEmployees();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error updating employee:', err);
        alert(err.error?.message || 'Something went wrong');
      }
    });

    return;
  }

  const payload = this.employeeForm.getRawValue();

  console.log('Employee form data:', payload);

  this.employeeService.createEmployee(payload as any)
    .subscribe({
      next: (res) => {
        console.log('Employee created successfully:', res);
        alert('Employee created successfully!');
        this.closeAddEmployeeModal();
        this.getEmployees();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error creating employee:', err);
        alert(err.error?.message || 'Something went wrong');
      }
    });
}

}