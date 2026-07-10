import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastService } from '../../../core/services/toast';
import { PatientService } from '../../../core/services/patient';

type IndiaState = {
  id: string;
  name: string;
};

type PostOfficeArea = {
  taluk: string;
  name: string;
  pincode: string;
};

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-patient.html',
  styleUrls: ['./add-patient.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPatient implements OnInit {
  readonly currentStep = signal(1);
  readonly isSubmitting = signal(false);
  readonly isLoadingStates = signal(false);
  readonly isLoadingDistricts = signal(false);
  readonly isLoadingTaluks = signal(false);
  readonly isLoadingAreas = signal(false);

  // today, districtCache, talukCache, areaCache stay as plain properties
  readonly today = new Date().toISOString().split('T')[0];
  patientForm!: FormGroup;

  readonly states = signal<IndiaState[]>([]);
  readonly districts = signal<string[]>([]);
  readonly taluks = signal<string[]>([]);
  readonly postOfficeAreas = signal<PostOfficeArea[]>([]);
  readonly filteredPostOfficeAreas = signal<PostOfficeArea[]>([]);

  selectedStateId = '';
  selectedPostOfficeIndex = '';

  private readonly districtCache = new Map<string, string[]>();
  private readonly talukCache = new Map<string, string[]>();
  private readonly areaCache = new Map<string, PostOfficeArea[]>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService,
    private readonly patientService: PatientService
  ) {
    this.patientForm = this.fb.group({
      // Basic Information
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      dateOfBirth: ['', [Validators.required, this.futureDateValidator]],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      // Contact Information
      countryCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      taluk: ['', Validators.required],
      postOffice: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      country: ['India'],
      // Emergency Contact
      emergencyContactName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      emergencyContactPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      // Medical Information
      medicalHistory: [''],
      allergies: [''],
      chronicDiseases: [''],
      currentMedications: [''],
      pastSurgeries: [''],
      familyMedicalHistory: [''],
      // Insurance Information
      insuranceProvider: [''],
      insurancePolicyNumber: [''],
      insuranceExpiryDate: [''],
      insuranceCoverageAmount: [''],
      // Hospital Information
      department: [''],
      patientType: ['', Validators.required]
    }, { validators: this.lastNameNotSameAsFirstName });
  }

  lastNameNotSameAsFirstName = (group: AbstractControl) => {
    const first = group.get('firstName')?.value?.trim().toLowerCase();
    const last = group.get('lastName')?.value?.trim().toLowerCase();
    if (first && last && first === last) {
      return { lastNameSameAsFirst: true };
    }
    return null;
  };

  ngOnInit(): void {
    this.loadStates();
  }

  loadStates(): void {
    this.isLoadingStates.set(true);

    this.patientService.getIndiaStates().subscribe({
      next: (response) => {
        this.states.set(response?.data || []);
        this.isLoadingStates.set(false);
      },
      error: () => {
        this.isLoadingStates.set(false);
        this.toastService.show('Unable to load states', 'error');
      }
    });
  }

  onStateChange(event: Event): void {
    const stateId = (event.target as HTMLSelectElement).value;
    const selectedState = this.states().find((state) => state.id === stateId);

    this.selectedStateId = stateId;
    this.districts.set([]);
    this.taluks.set([]);
    this.postOfficeAreas.set([]);
    this.filteredPostOfficeAreas.set([]);
    this.selectedPostOfficeIndex = '';

    this.patientForm.patchValue({
      state: selectedState?.name || '',
      city: '',
      taluk: '',
      postOffice: '',
      pincode: ''
    });

    if (!stateId) {
      return;
    }

    this.isLoadingDistricts.set(true);

    const cachedDistricts = this.districtCache.get(stateId);

    if (cachedDistricts) {
      this.districts.set(cachedDistricts);
      this.isLoadingDistricts.set(false);

      return;
    }

    this.patientService.getIndiaDistricts(stateId).subscribe({
      next: (response) => {
        const data = response?.data || [];
        this.districts.set(data);
        this.districtCache.set(stateId, data);
        this.isLoadingDistricts.set(false);
      },
      error: () => {
        this.isLoadingDistricts.set(false);
        this.toastService.show('Unable to load districts', 'error');
      }
    });
  }

  onDistrictChange(): void {
    const state = this.patientForm.get('state')?.value;
    const district = this.patientForm.get('city')?.value;

    this.taluks.set([]);
    this.postOfficeAreas.set([]);
    this.filteredPostOfficeAreas.set([]);
    this.selectedPostOfficeIndex = '';
    this.patientForm.patchValue({
      taluk: '',
      postOffice: '',
      pincode: ''
    });

    if (!state || !district) {
      return;
    }

    this.loadTaluks(state, district);
    this.loadPostOfficeAreas(state, district);
  }

  private loadTaluks(state: string, district: string): void {
    const cacheKey = `${state}:${district}`;
    const cachedTaluks = this.talukCache.get(cacheKey);

    if (cachedTaluks) {
      this.applyTaluks(cachedTaluks);

      return;
    }

    this.isLoadingTaluks.set(true);

    this.patientService.getIndiaTaluks(state, district).subscribe({
      next: (response) => {
        const taluks = response?.data || [];

        this.talukCache.set(cacheKey, taluks);
        this.applyTaluks(taluks);
        this.isLoadingTaluks.set(false);
      },
      error: () => {
        this.isLoadingTaluks.set(false);
        this.toastService.show('Unable to load taluks', 'error');
      }
    });
  }

  private applyTaluks(taluks: string[]): void {
    this.taluks.set(taluks);

    if (taluks.length === 1) {
      this.patientForm.patchValue({
        taluk: taluks[0]
      });

      this.onTalukChange();
    }
  }

  private loadPostOfficeAreas(state: string, district: string): void {
    this.isLoadingAreas.set(true);

    const cacheKey = `${state}:${district}`;
    const cachedAreas = this.areaCache.get(cacheKey);

    if (cachedAreas) {
      this.applyPostOfficeAreas(cachedAreas);
      this.isLoadingAreas.set(false);

      return;
    }

    this.patientService.getIndiaPostOffices(state, district).subscribe({
      next: (response) => {
        const areas = response?.data || [];

        this.areaCache.set(cacheKey, areas);
        this.applyPostOfficeAreas(areas);
        this.isLoadingAreas.set(false);
      },
      error: () => {
        this.isLoadingAreas.set(false);
        this.toastService.show('Unable to load post offices', 'error');
      }
    });
  }

  private applyPostOfficeAreas(areas: PostOfficeArea[]): void {
    this.postOfficeAreas.set(areas);
    this.onTalukChange();
  }

  onTalukChange(): void {
    const taluk = this.patientForm.get('taluk')?.value;

    const matchingAreas = this.postOfficeAreas().filter((area) => area.taluk === taluk);

    this.filteredPostOfficeAreas.set(matchingAreas.length > 0 ? matchingAreas : this.postOfficeAreas());
    this.selectedPostOfficeIndex = '';

    this.patientForm.patchValue({
      postOffice: '',
      pincode: ''
    });

    const filtered = this.filteredPostOfficeAreas();
    if (filtered.length === 1) {
      const area = filtered[0];

      this.patientForm.patchValue({
        postOffice: area.name,
        pincode: area.pincode
      });

      this.selectedPostOfficeIndex = '0';
    }
  }

  onPostOfficeChange(event: Event): void {
    this.selectedPostOfficeIndex = (event.target as HTMLSelectElement).value;

    if (this.selectedPostOfficeIndex === '') {
      this.patientForm.patchValue({
        postOffice: '',
        pincode: ''
      });

      return;
    }

    const selectedIndex = Number(this.selectedPostOfficeIndex);
    const area = this.filteredPostOfficeAreas()[selectedIndex];

    this.patientForm.patchValue({
      postOffice: area?.name || '',
      pincode: area?.pincode || ''
    });
  }

  futureDateValidator = (control: any) => {
    if (!control.value) {
      return null;
    }

    return new Date(control.value) > new Date()
      ? {
          futureDate: true
        }
      : null;
  };

  // Move to next step after validating current step
  nextStep(): void {
    const stepFields: { [key: number]: string[] } = {
      1: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'bloodGroup', 'maritalStatus'],
      2: [
        'phone',
        'email',
        'address',
        'state',
        'city',
        'taluk',
        'postOffice',
        'pincode',
        'emergencyContactName',
        'emergencyContactPhone'
      ],
      3: [],
      4: ['patientType']
    };

    const fieldsToValidate = stepFields[this.currentStep()] || [];

    fieldsToValidate.forEach((field) => {
      this.patientForm.get(field)?.markAsTouched();
    });

    const isStepValid = fieldsToValidate.every((field) => this.patientForm.get(field)?.valid);

    if (!isStepValid) {
      return;
    }

    if (this.currentStep() < 4) {
      this.currentStep.update(s => s + 1);
    }
  }

  // Go back to previous step
  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  // Register patient
  onSubmit(): void {
    console.log('Register Patient Clicked');
    console.log(this.patientForm.value);

    this.patientForm.get('patientType')?.markAsTouched();

    if (this.patientForm.get('patientType')?.invalid) {
      return;
    }

    if (this.patientForm.invalid) {
      console.log('FORM INVALID');

      Object.keys(this.patientForm.controls).forEach((key) => {
        const control = this.patientForm.get(key);

        if (control?.invalid) {
          console.log(key, control.errors);
        }
      });

      this.patientForm.markAllAsTouched();

      return;
    }

    this.isSubmitting.set(true);

    this.patientService.createPatient(this.patientForm.value).subscribe({
      next: (response) => {
        console.log(response);

        this.toastService.show('Patient Registered Successfully', 'success');

        // Reset form
        this.patientForm.reset();

        // Restore default values
        this.patientForm.patchValue({
          countryCode: '+91',
          country: 'India',
          patientType: ''
        });

        // Reset UI state
        this.currentStep.set(1);
        this.selectedStateId = '';
        this.districts.set([]);
        this.taluks.set([]);
        this.postOfficeAreas.set([]);
        this.filteredPostOfficeAreas.set([]);
        this.selectedPostOfficeIndex = '';
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.log('FULL ERROR =>', error);
        console.log('VALIDATION ERRORS =>', error?.error?.errors);

        const validationMessage = Array.isArray(error?.error?.errors)
          ? error.error.errors
              .map((item: any) => item.msg || item.message)
              .filter(Boolean)
              .join(', ')
          : error?.error?.message;

        this.toastService.error(validationMessage || 'Unable to register patient');

        this.isSubmitting.set(false);
      }
    });
  }
}
