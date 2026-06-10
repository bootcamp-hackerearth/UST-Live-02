import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { DoctorService } from '../../services/doctor.service';
import { Doctor } from '../../models/doctor.model';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors implements OnInit {

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];


  currentPage = 1;
  pageSize = 10;
  searchText = '';
  showAddDoctorModal = false;

  isEditMode = false;
  selectedDoctor: Doctor | null = null;
  departments = [
    'OPD', 'IPD', 'Lab',
    'Pharmacy', 'Admin', 'Front Office'
  ];

  designations = ['Jr Doctor'];

  timeOptions = [
    '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM',
    '08:00 PM'
  ];

 
  doctorForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^(?!\s+$)[A-Za-z\s]+$/)
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^(?!\s+$)[A-Za-z\s]+$/)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,

    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$')
    ]),
    department: new FormControl('', [
      Validators.required
    ]),
    designation: new FormControl('Jr Doctor', [
      Validators.required
    ]),
    joiningDate: new FormControl('', [
      Validators.required
    ]),
    specialization: new FormControl('', [
      Validators.required
    ]),
    qualification: new FormControl('', [
      Validators.required
    ]),
    consultationFee: new FormControl(null, [
      Validators.required,
      Validators.min(1)
    ]),
    medicalRegistrationNo: new FormControl('', [
      Validators.required
    ]),
    availabilityStartTime: new FormControl('', [
      Validators.required
    ]),
    availabilityEndTime: new FormControl('', [
      Validators.required
    ]),
    experienceYears: new FormControl(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(60)
    ])
  }, {
    validators: this.availabilityTimeValidator
  });

  constructor(
    readonly doctorService: DoctorService,
    readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getDoctors();
  }

 
 
 

  availabilityTimeValidator(group: AbstractControl): ValidationErrors | null {
    const startTime = group.get('availabilityStartTime')?.value;
    const endTime = group.get('availabilityEndTime')?.value;

    if (!startTime || !endTime) return null;

    const parseTime = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (end <= start) {
      return { invalidAvailability: true };
    }

   
    if (end - start < 60) {
      return { minAvailability: true };
    }

    return null;
  }

 
 
 

  getDoctors() {
    this.doctorService.getAllDoctors()
      .subscribe({
        next: (res) => {
          this.doctors = res.data;
          this.filteredDoctors = res.data;
          console.log('Doctors:', this.doctors);
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching doctors:', err);
        }
      });
  }

  get paginatedDoctors(): Doctor[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return this.filteredDoctors.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDoctors.length / this.pageSize);
  }

  get startRecord(): number {
    if (this.filteredDoctors.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredDoctors.length
    );
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
 
 
 

  filterDoctors() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.filteredDoctors = [...this.doctors];
      this.currentPage = 1;
      return;
    }

    this.filteredDoctors = this.doctors.filter(doctor =>
      doctor.employeeCode?.toLowerCase().includes(search) ||
      doctor.firstName?.toLowerCase().includes(search) ||
      doctor.lastName?.toLowerCase().includes(search) ||
      doctor.email?.toLowerCase().includes(search) ||
      doctor.phone?.includes(search) ||
      doctor.specialization?.toLowerCase().includes(search) ||
      doctor.qualification?.toLowerCase().includes(search) ||
      doctor.medicalRegistrationNo?.toLowerCase().includes(search)
    );
    this.currentPage = 1;
  }

 
 
 

  openAddDoctorModal() {
    this.isEditMode = false;
    this.selectedDoctor = null;

    this.doctorForm.reset({ designation: 'Jr Doctor' });

    this.doctorForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(6)
    ]);
    this.doctorForm.get('password')?.updateValueAndValidity();

    this.showAddDoctorModal = true;
  }
  openEditDoctorModal(doctor: Doctor) {
    this.isEditMode = true;
    this.selectedDoctor = doctor;

    this.doctorForm.reset();

    this.doctorForm.patchValue({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      password: '',
      phone: doctor.phone,
      department: doctor.department,
      designation: doctor.designation,
      joiningDate: doctor.joiningDate ? doctor.joiningDate.split('T')[0] : '',
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      consultationFee: doctor.consultationFee as any,
      medicalRegistrationNo: doctor.medicalRegistrationNo,
      availabilityStartTime: doctor.availabilityStartTime,
      availabilityEndTime: doctor.availabilityEndTime,
      experienceYears: doctor.experienceYears as any
    });

    this.doctorForm.get('password')?.clearValidators();
    this.doctorForm.get('password')?.updateValueAndValidity();

    this.showAddDoctorModal = true;
  }
  closeAddDoctorModal() {
    this.showAddDoctorModal = false;
    this.isEditMode = false;
    this.selectedDoctor = null;

    this.doctorForm.reset({ designation: 'Jr Doctor' });

    this.doctorForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(6)
    ]);
    this.doctorForm.get('password')?.updateValueAndValidity();
  }

 
 
 

  saveDoctor() {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.selectedDoctor) {
      const payload = {
        firstName: this.doctorForm.get('firstName')?.value,
        lastName: this.doctorForm.get('lastName')?.value,
        email: this.doctorForm.get('email')?.value,
        phone: this.doctorForm.get('phone')?.value,
        department: this.doctorForm.get('department')?.value,
        designation: this.doctorForm.get('designation')?.value,
        joiningDate: this.doctorForm.get('joiningDate')?.value,
        status: this.selectedDoctor.status,

        specialization: this.doctorForm.get('specialization')?.value,
        qualification: this.doctorForm.get('qualification')?.value,
        consultationFee: this.doctorForm.get('consultationFee')?.value,
        medicalRegistrationNo: this.doctorForm.get('medicalRegistrationNo')?.value,
        availabilityStartTime: this.doctorForm.get('availabilityStartTime')?.value,
        availabilityEndTime: this.doctorForm.get('availabilityEndTime')?.value,
        experienceYears: this.doctorForm.get('experienceYears')?.value
      };

      this.doctorService.updateDoctor(
        this.selectedDoctor.doctorId,
        payload as any
      ).subscribe({
        next: (res) => {
          console.log('Doctor updated successfully:', res);
          alert('Doctor updated successfully!');
          this.closeAddDoctorModal();
          this.getDoctors();
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Full error:', err);
          console.error('Backend error body:', err.error);
          console.error('Backend message:', err.error?.message);
          alert(err.error?.message || 'Something went wrong');
        }
      });

      return;
    }

    const payload = this.doctorForm.value;

    console.log('Doctor form data:', payload);

    this.doctorService.createDoctor(payload as any)
      .subscribe({
        next: (res) => {
          console.log('Doctor created successfully:', res);
          alert('Doctor created successfully!');
          this.closeAddDoctorModal();
          this.getDoctors();
          this.cd.detectChanges();
        },
        error: (err) => {
          console.log('Error creating doctor:', err);
          console.log('Backend validation errors:', err.error?.errors);
          console.log('Backend message:', err.error?.message);
          alert(err.error?.message || 'Something went wrong');
        }
      });
  }

}