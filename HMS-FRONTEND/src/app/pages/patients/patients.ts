import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Patient, CreatePatientPayload } from '../../models/patients.model';
import { PatientService } from '../../services/patient.service';


function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const selected = new Date(control.value);
  const today = new Date();

  selected.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selected > today ? { futureDate: true } : null;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class Patients implements OnInit {

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  searchText = '';
  showAddPatientModal = false;

 
 
 

  patientForm = new FormGroup({
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
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('^[6-9][0-9]{9}$')
    ]),
    gender: new FormControl('', [
      Validators.required
    ]),
    dob: new FormControl('', [
      Validators.required,
      futureDateValidator
    ]),
    bloodGroup: new FormControl('', [
      Validators.required
    ]),
    address: new FormGroup({
      city: new FormControl(''),
      state: new FormControl(''),
      pincode: new FormControl('', [
        Validators.pattern('^[0-9]{6}$')
      ])
    }),
    emergencyContactName: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    emergencyContactPhone: new FormControl('', [
      Validators.required,
      Validators.pattern('^[6-9][0-9]{9}$')
    ])
  });

  constructor(
    readonly patientService: PatientService,
    readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getPatients();
  }

 
 
 

  getPatients() {
    this.patientService.getAllPatients()
      .subscribe({
        next: (res) => {
          this.patients = res.data;
          this.filteredPatients = res.data;
          console.log('Patients:', this.patients);
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching patients:', err);
        }
      });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPatients.length / this.itemsPerPage);
  }

  get paginatedPatients(): Patient[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return this.filteredPatients.slice(startIndex, endIndex);
  }

  get startRecord(): number {
    if (this.filteredPatients.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

get endRecord(): number {
  const end = this.currentPage * this.itemsPerPage;
  return Math.min(end, this.filteredPatients.length);
}

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

 
 
 

  filterPatients() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.filteredPatients = [...this.patients];
      return;
    }

    this.filteredPatients = this.patients.filter(patient =>
      patient.UHID?.toLowerCase().includes(search) ||
      patient.firstName?.toLowerCase().includes(search) ||
      patient.lastName?.toLowerCase().includes(search) ||
      patient.phone?.includes(search) ||
      patient.gender?.toLowerCase().includes(search) ||
      patient.bloodGroup?.toLowerCase().includes(search) ||
      patient.city?.toLowerCase().includes(search) ||
      patient.state?.toLowerCase().includes(search) ||
      patient.createdByName?.toLowerCase().includes(search)
    );
    this.currentPage = 1;
  }

 
 
 

  openAddPatientModal() {
    this.patientForm.reset();
    this.showAddPatientModal = true;
    document.body.classList.add('modal-open');
  }

  closeAddPatientModal() {
    this.showAddPatientModal = false;
    this.patientForm.reset();
    document.body.classList.remove('modal-open');
  }

 
 
 

  savePatient() {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const payload = this.patientForm.value as CreatePatientPayload;


    console.log('Patient form data:', payload);

    this.patientService.createPatient(payload)
      .subscribe({
        next: (res) => {
          console.log('Patient created successfully:', res);
          alert('Patient created successfully!');
          this.closeAddPatientModal();
          this.getPatients();
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error creating patient:', err);
          alert(err.error?.message || 'Something went wrong');
        }
      });
  }

}