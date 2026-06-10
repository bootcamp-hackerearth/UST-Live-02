import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import {
  DepartmentModel,
  RoleModel,
  SpecializationModel,
} from '../../../../models/ui.model';

import { AuthService } from '../../../../services/auth.service';
import { mapToSignUpRequest } from '../../../mapper/mapToSignUpRequest';
import {
  futureDateValidator,
  timeRangeValidator,
} from '../../../../validators/time-range-validator';

@Component({
  selector: 'app-signup-modal',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './signup-modal.html',
  styleUrl: './signup-modal.css',
})
export class SignUpModalComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly toast = inject(ToastrService);
  readonly cd = inject(ChangeDetectorRef);
  readonly router = inject(Router);
  readonly fb = inject(FormBuilder);

  signUpModalForm: FormGroup;
  isLoading = false;

  roles_data: RoleModel[] = [];
  departments_data: DepartmentModel[] = [];
  specializations_data: SpecializationModel[] = [];

  hours = Array.from({ length: 24 }, (_, i) => i);
  generatedSlots: string[] = [];

  constructor() {
    this.signUpModalForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUiSelections();
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        name: ['', [Validators.required, Validators.pattern(/^[a-z]+( [a-z]+)*$/i)]],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
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
        qualification: ['', [Validators.pattern(/^[a-z]+([ -][a-z]+)*$/i),Validators.required]],
        consultationFee: [''],
        startHour: [''],
        endHour: [''],
        availabilitySlots: this.fb.array([]),
      },
      {
        validators: [timeRangeValidator, futureDateValidator],
      }
    );
  }

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

  get availabilitySlots(): FormArray {
    return this.signUpModalForm.get('availabilitySlots') as FormArray;
  }

  generateTimeSlots(): void {
    const { startHour, endHour } = this.signUpModalForm.value;

    if (!startHour || !endHour) {
      return;
    }

    const start = Number(startHour);
    const end = Number(endHour);

    if (start >= end) {
      return;
    }

    this.generatedSlots = [];

    for (let hour = start; hour < end; hour++) {
      this.generatedSlots.push(
        `${this.formatHour(hour)} : 00 - ${this.formatHour(hour)} : 30`,
        `${this.formatHour(hour)} : 30 - ${this.formatHour(hour + 1)} : 00`
      );
    }
  }

  toggleSlot(slot: string): void {
    const selectedIndex = this.availabilitySlots.value.indexOf(slot);

    if (selectedIndex > -1) {
      this.availabilitySlots.removeAt(selectedIndex);
      return;
    }

    this.availabilitySlots.push(this.fb.control(slot));
  }

  private formatHour(hour: number): string {
    return hour.toString().padStart(2, '0');
  }

  onSubmit(): void {
    if (this.signUpModalForm.invalid) {
      this.toast.error('Please fill all required fields correctly');
      return;
    }

    this.isLoading = true;

    const payload = mapToSignUpRequest(this.signUpModalForm);

    this.auth.signUp(payload).subscribe({
      next: (res) => this.processSuccessResponse(res),
      error: (err) => this.processErrorResponse(err),
    });
  }

  private processSuccessResponse(res: any): void {
    this.isLoading = false;
    this.cd.detectChanges();
    this.toast.success(res.message);
    this.router.navigate(['/employee']);
  }

  private processErrorResponse(err: any): void {
    this.isLoading = false;
    this.cd.detectChanges();
    this.toast.error(err?.error?.message || err?.message || 'Something went wrong!');
  }
}