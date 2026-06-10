import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { passwordsMatchValidator } from '../../validators/password-match-validator';
import { AuthService } from '../../services/auth.service';
import { DepartmentModel, RoleModel, SpecializationModel } from '../../models/ui.model';
import { mapToSignUpRequest } from '../mapper/mapToSignUpRequest';
import { futureDateValidator, timeRangeValidator } from '../../validators/time-range-validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.htm',
  styleUrl: './signup.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  auth: AuthService = inject(AuthService);
  route: Router = inject(Router);
  cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  toast: ToastrService = inject(ToastrService);

  roles_data: RoleModel[] = [];
  departments_data: DepartmentModel[] = [];
  specializations_data: SpecializationModel[] = [];

  isLoading: boolean = false;

  ngOnInit(): void {
    this.loadUiSelections();
  }

  public constructor(readonly fb: FormBuilder) {
    this.signUpForm = this.createForm();
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
            Validators.pattern(/^[a-z0-9._]+@[a-z0-9]*\.[a-z]{2,}$/i),
          ],
        ],
        role: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
        confirmPassword: [''],
        department: ['', Validators.required],
        designation: ['', Validators.required],
        status: ['Pending'],
        joiningDate: ['', Validators.required],
        medicalRegistrationNo: ['', Validators.pattern(/^[a-z0-9]*$/i)],
        specialization: [''],
        qualification: ['', [Validators.pattern(/^[a-z]+([ -][a-z]+)*$/i), Validators.required]],
        consultationFee: [''],
        startHour: [''],
        endHour: [''],
        availabilitySlots: this.fb.array([]),
      },
      {
        validators: [timeRangeValidator, futureDateValidator, passwordsMatchValidator],
      },
    );
  }

  hours = Array.from({ length: 24 }, (_, index) => index);
  generatedSlots: any[] = [];

  private loadUiSelections(): void {
    this.requestUiData<RoleModel[]>('/ui/getRoles', (roles) => (this.roles_data = roles));
    this.requestUiData<DepartmentModel[]>('/ui/getDepartments', (departments) => (this.departments_data = departments));
    this.requestUiData<SpecializationModel[]>('/ui/getSpecializations', (specializations) => (this.specializations_data = specializations));
  }

  private requestUiData<T>(url: string, assign: (data: T) => void): void {
    this.auth.getUiData<T>(url).subscribe((data) => {
      assign(data);
      this.cd.detectChanges();
    });
  }

  generateTimeSlots(): void {
    let startHour = this.signUpForm.get('startHour')?.value;
    let endHour = this.signUpForm.get('endHour')?.value;

    if (!startHour || !endHour) {
      return;
    }

    startHour = Number(startHour);
    endHour = Number(endHour);

    if (startHour >= endHour) {
      return;
    }

    this.generatedSlots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      this.generatedSlots.push(
        `${this.formatHour(hour)} : 00 - ${this.formatHour(hour)} : 30`,
        `${this.formatHour(hour)} : 30 - ${this.formatHour(hour + 1)} : 00`,
      );
    }
  }

  toggleSlot(slot: string): void {
    const arr = this.signUpForm.get('availabilitySlots') as FormArray;
    const selectedIndex = arr.value.indexOf(slot);

    if (selectedIndex > -1) {
      arr.removeAt(selectedIndex);
      return;
    }

    arr.push(this.fb.control(slot));
  }

  private formatHour(value: number): string {
    return value.toString().padStart(2, '0');
  }

  onSubmit(): void {
    if (!this.signUpForm.valid) {
      this.toast.warning('Validation failed,please check the fields');
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = mapToSignUpRequest(this.signUpForm);

    this.auth.signUp(payload).subscribe({
      next: (res) => this.processSuccessResponse(res),
      error: (err) => this.processErrorResponse(err),
    });
  }

  private processSuccessResponse(res: any): void {
    this.isLoading = false;
    this.toast.success(res.message);
    this.route.navigate(['/login']);
  }

  private processErrorResponse(err: any): void {
    this.isLoading = false;
    this.toast.error(err?.error?.message || err?.message || 'Something went wrong!');
  }
}
