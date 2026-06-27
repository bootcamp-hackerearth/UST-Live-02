import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastService } from '../../../core/services/toast';
import { PatientService } from '../../../core/services/patient';
import { getApiErrorMessage } from '../../../core/utils/api-error';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-add-patient',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-patient.html',
  styleUrls: ['./add-patient.css']
})
export class AddPatient implements OnInit {
  currentStep = 1;
  isSubmitting = false;
  isLoadingStates = false;
  isLoadingDistricts = false;
  isLoadingTaluks = false;
  isLoadingAreas = false;
  today = new Date().toISOString().split('T')[0];
  patientForm!: FormGroup;
  states: IndiaState[] = [];
  districts: string[] = [];
  taluks: string[] = [];
  postOfficeAreas: PostOfficeArea[] = [];
  filteredPostOfficeAreas: PostOfficeArea[] = [];
  selectedStateId = '';
  selectedPostOfficeIndex = '';
  private readonly districtCache = new Map<string, string[]>();
  private readonly talukCache = new Map<string, string[]>();
  private readonly areaCache = new Map<string, PostOfficeArea[]>();
  private readonly namePattern = /^[A-Za-z\s'-]+$/;

  constructor(
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService,
    private readonly patientService: PatientService
  ) {
    this.patientForm = this.fb.group({
      // Basic Information
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(this.namePattern)
        ]
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(this.namePattern)
        ]
      ],
      dateOfBirth: ['', [Validators.required, this.futureDateValidator]],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      maritalStatus: ['', Validators.required],

      // Contact Information
      countryCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      taluk: ['', Validators.required],
      postOffice: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      country: ['India'],

      // Emergency Contact
      emergencyContactName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(this.namePattern)
        ]
      ],
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
      insuranceCoverageAmount: ['', Validators.min(0)],

      // Hospital Information
      department: [''],
      patientType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStates();
  }

  loadStates(): void {
    this.isLoadingStates = true;

    this.patientService.getIndiaStates().subscribe({
      next: (response) => {
        this.states = response?.data || [];
        this.isLoadingStates = false;
      },
      error: () => {
        this.isLoadingStates = false;
        this.toastService.show('Unable to load states', 'error');
      }
    });
  }

  onStateChange(event: Event): void {
    const stateId = (event.target as HTMLSelectElement).value;
    const selectedState = this.states.find((state) => state.id === stateId);

    this.selectedStateId = stateId;
    this.districts = [];
    this.taluks = [];
    this.postOfficeAreas = [];
    this.filteredPostOfficeAreas = [];
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

    this.isLoadingDistricts = true;

    const cachedDistricts = this.districtCache.get(stateId);

    if (cachedDistricts) {
      this.districts = cachedDistricts;
      this.isLoadingDistricts = false;

      return;
    }

    this.patientService.getIndiaDistricts(stateId).subscribe({
      next: (response) => {
        this.districts = response?.data || [];
        this.districtCache.set(stateId, this.districts);
        this.isLoadingDistricts = false;
      },
      error: () => {
        this.isLoadingDistricts = false;
        this.toastService.show('Unable to load districts', 'error');
      }
    });
  }

  onDistrictChange(): void {
    const state = this.patientForm.get('state')?.value;
    const district = this.patientForm.get('city')?.value;

    this.taluks = [];
    this.postOfficeAreas = [];
    this.filteredPostOfficeAreas = [];
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

    this.isLoadingTaluks = true;

    this.patientService.getIndiaTaluks(state, district).subscribe({
      next: (response) => {
        const taluks = response?.data || [];

        this.talukCache.set(cacheKey, taluks);
        this.applyTaluks(taluks);
        this.isLoadingTaluks = false;
      },
      error: () => {
        this.isLoadingTaluks = false;
        this.toastService.show('Unable to load taluks', 'error');
      }
    });
  }

  private applyTaluks(taluks: string[]): void {
    this.taluks = taluks;

    if (this.taluks.length === 1) {
      this.patientForm.patchValue({
        taluk: this.taluks[0]
      });

      this.onTalukChange();
    }
  }

  private loadPostOfficeAreas(state: string, district: string): void {
    this.isLoadingAreas = true;

    const cacheKey = `${state}:${district}`;
    const cachedAreas = this.areaCache.get(cacheKey);

    if (cachedAreas) {
      this.applyPostOfficeAreas(cachedAreas);
      this.isLoadingAreas = false;

      return;
    }

    this.patientService.getIndiaPostOffices(state, district).subscribe({
      next: (response) => {
        const areas = response?.data || [];

        this.areaCache.set(cacheKey, areas);
        this.applyPostOfficeAreas(areas);
        this.isLoadingAreas = false;
      },
      error: () => {
        this.isLoadingAreas = false;
        this.toastService.show('Unable to load post offices', 'error');
      }
    });
  }

  private applyPostOfficeAreas(areas: PostOfficeArea[]): void {
    this.postOfficeAreas = areas;
    this.onTalukChange();
  }

  onTalukChange(): void {
    const taluk = this.patientForm.get('taluk')?.value;

    const matchingAreas = this.postOfficeAreas.filter((area) => area.taluk === taluk);

    this.filteredPostOfficeAreas = matchingAreas.length > 0 ? matchingAreas : this.postOfficeAreas;
    this.selectedPostOfficeIndex = '';

    this.patientForm.patchValue({
      postOffice: '',
      pincode: ''
    });

    if (this.filteredPostOfficeAreas.length === 1) {
      const area = this.filteredPostOfficeAreas[0];

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
    const area = this.filteredPostOfficeAreas[selectedIndex];

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

    const fieldsToValidate = stepFields[this.currentStep] || [];

    fieldsToValidate.forEach((field) => {
      this.patientForm.get(field)?.markAsTouched();
    });

    const isStepValid = fieldsToValidate.every((field) => this.patientForm.get(field)?.valid);

    if (!isStepValid) {
      return;
    }

    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  // Go back to previous step
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Register patient
  onSubmit(): void {
    this.patientForm.get('patientType')?.markAsTouched();

    if (this.patientForm.get('patientType')?.invalid) {
      return;
    }

    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.patientService.createPatient(this.patientForm.value).subscribe({
      next: () => {
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
        this.currentStep = 1;
        this.selectedStateId = '';
        this.districts = [];
        this.taluks = [];
        this.postOfficeAreas = [];
        this.filteredPostOfficeAreas = [];
        this.selectedPostOfficeIndex = '';
        this.isSubmitting = false;
      },

      error: (error) => {
        this.toastService.show(
          getApiErrorMessage(error, 'Failed to register patient'),
          'error'
        );

        this.isSubmitting = false;
      }
    });
  }
}
 
