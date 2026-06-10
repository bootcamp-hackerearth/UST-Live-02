import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { UserEmployeeModel } from '../../../../models/user.model';
import { AdminService } from '../../../../services/admin.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DepartmentModel, RoleModel, SpecializationModel } from '../../../../models/ui.model';
import { AuthService } from '../../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import {
  futureDateValidator,
  timeRangeValidator,
} from '../../../../validators/time-range-validator';

@Component({
  selector: 'app-edit-employee',
  imports: [RouterLink, RouterModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './edit-employee.html',
  styleUrl: './edit-employee.css',
})
export class EditEmployeeComponent implements OnInit {
  adminService: AdminService = inject(AdminService);
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  toast: ToastrService = inject(ToastrService);
  cd: ChangeDetectorRef = inject(ChangeDetectorRef);

  isLoading = false;
  updateForm: FormGroup;

  roles_data: RoleModel[] = [];
  departments_data: DepartmentModel[] = [];
  specializations_data: SpecializationModel[] = [];

  users: UserEmployeeModel[] | null = null;
  userData: UserEmployeeModel | null = null;

  constructor(readonly fb: FormBuilder) {
    this.updateForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadUiSelections();
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        name: ['', [Validators.required, Validators.pattern(/^[a-z]+( [a-z]+)*$/i)]],
        email: [
          '',
          [
            Validators.email,
            Validators.required,
            Validators.pattern(/^[a-z0-9._]+@[a-z0-9]+\.[a-z]{2,}$/i),
          ],
        ],
        role: ['', Validators.required],
        department: ['', Validators.required],
        designation: ['', Validators.required],
        status: ['Active'],
        joiningDate: ['', Validators.required],
        medicalRegistrationNo: ['', Validators.pattern(/^[a-z0-9]*$/i)],
        specialization: [''],
        qualification: ['', [Validators.pattern(/^[a-z ]*$/i)]],
        consultationFee: ['', [Validators.pattern(/^\d+$/)]],
        startHour: ['', [Validators.min(0)]],
        endHour: ['', [Validators.max(23)]],
        availabilitySlots: this.fb.array([]),
      },
      {
        validators: [timeRangeValidator, futureDateValidator],
      },
    );
  }

  private loadUserData(): void {
    const userEmail = localStorage.getItem('updateEmail') ?? '';

    this.adminService.getUserEmployee().subscribe({
      next: (res) => {
        this.users = res;
        this.userData = this.users.find((emp) => emp.email === userEmail) || null;
        this.patchUserValues();
        this.cd.detectChanges();
      },
      error: (err) => {
        this.toast.error(err?.error?.message);
        if (err.status === 403) {
          this.router.navigate(['/access-denied']);
        }
      },
    });
  }

  private loadUiSelections(): void {
    this.requestUiData<RoleModel[]>('/ui/getRoles', (roles) => (this.roles_data = roles));
    this.requestUiData<DepartmentModel[]>('/ui/getDepartments', (departments) => (this.departments_data = departments));
    this.requestUiData<SpecializationModel[]>('/ui/getSpecializations', (specializations) => (this.specializations_data = specializations));
  }

  private requestUiData<T>(url: string, assign: (data: T) => void): void {
    this.authService.getUiData<T>(url).subscribe((res) => {
      assign(res);
      this.cd.detectChanges();
    });
  }

  private patchUserValues(): void {
    this.updateForm.patchValue({
      name: this.userData?.name,
      email: this.userData?.email,
      role: this.userData?.role,
      department: this.userData?.department,
      designation: this.userData?.designation,
      joiningDate: this.userData?.joiningDate ? this.userData.joiningDate.toString().split('T')[0] : '',
      medicalRegistrationNo: this.userData?.medicalRegistrationNo,
      specialization: this.userData?.specialization,
      qualification: this.userData?.qualification,
      consultationFee: this.userData?.consultationFee,
    });

    const slotsArray = this.updateForm.get('availabilitySlots') as FormArray;
    slotsArray.clear();

    (this.userData?.availabilitySlots || []).forEach((slot) => slotsArray.push(this.fb.control(slot)));
  }

  hours = Array.from({ length: 24 }, (_, index) => index);
  generatedSlots: any[] = [];

  generateTimeSlots(): void {
    let startHour = this.updateForm.get('startHour')?.value;
    let endHour = this.updateForm.get('endHour')?.value;

    if (!startHour || !endHour) {
      return;
    }

    startHour = Number(startHour);
    endHour = Number(endHour);

    if (startHour >= endHour) {
      return;
    }

    this.generatedSlots = [];

    if (this.userData?.availabilitySlots) {
      this.generatedSlots.push(...(this.userData?.availabilitySlots || []));
    }

    for (let hour = startHour; hour < endHour; hour++) {
      this.generatedSlots.push(
        `${this.formatHour(hour)} : 00 - ${this.formatHour(hour)} : 30`,
        `${this.formatHour(hour)} : 30 - ${this.formatHour(hour + 1)} : 00`,
      );
    }
  }

  toggleSlot(slot: string): void {
    const arr = this.updateForm.get('availabilitySlots') as FormArray;
    const index = arr.value.indexOf(slot);

    if (index === -1) {
      arr.push(this.fb.control(slot));
      return;
    }

    arr.removeAt(index);
  }

  private formatHour(value: number): string {
    return value.toString().padStart(2, '0');
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      this.toast.error('Please fill all required fields correctly');
      return;
    }

    this.isLoading = true;

    const payload = {
      employeeId: this.userData?.employeeId,
      data: {
        name: this.updateForm.get('name')?.value,
        email: this.updateForm.get('email')?.value,
        designation: this.updateForm.get('designation')?.value,
        role: this.updateForm.get('role')?.value,
        department: this.updateForm.get('department')?.value,
        status: this.updateForm.get('status')?.value,
        joiningDate: this.updateForm.get('joiningDate')?.value,
        medicalRegistrationNo: this.updateForm.get('medicalRegistrationNo')?.value,
        specialization: this.updateForm.get('specialization')?.value,
        qualification: this.updateForm.get('qualification')?.value,
        availabilitySlots: this.updateForm.get('availabilitySlots')?.value,
        consultationFee: this.updateForm.get('consultationFee')?.value,
      },
    };

    this.adminService.updateUserProfile(payload).subscribe({
      next: (res) => this.processSuccessResponse(res),
      error: (err) => this.processErrorResponse(err),
    });
  }

  private processSuccessResponse(res: any): void {
    this.isLoading = false;
    this.toast.success(res.message);
    this.router.navigate(['/employee']);
  }

  private processErrorResponse(err: any): void {
    this.isLoading = false;
    this.toast.error(err?.error?.message || err?.message || 'Something went wrong!');
  }
}
