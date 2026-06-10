import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-join-us',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './join-us.html',
  styleUrl: './join-us.css'
})
export class JoinUs {

  emailChecked = false;
  isCheckingEmail = false;
  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  emailData = {
    email: ''
  };

  joinUsData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    department: '',
    designation: '',
    joiningDate: '',

    specialization: '',
    qualification: '',
    consultationFee: null as number | null,
    medicalRegistrationNo: '',
    availabilityStartTime: '',
    availabilityEndTime: '',
    experienceYears: null as number | null
  };

  constructor(
    private auth: Auth,
    private cd: ChangeDetectorRef
  ) {}

  checkEmail() {
    this.successMessage = '';
    this.errorMessage = '';
    this.isCheckingEmail = true;

    this.auth.checkJoinUsEmail(this.emailData).subscribe({
      next: (res: any) => {
        console.log('Check email response:', res);

        this.successMessage = res.message || 'Email available. Continue filling the form.';
        this.emailChecked = true;

        this.joinUsData.email = this.emailData.email;

        this.isCheckingEmail = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.log('Check email error:', err);

        this.errorMessage = err.error?.message || 'Email already exists';
        this.emailChecked = false;

        this.isCheckingEmail = false;
        this.cd.detectChanges();
      }
    });
  }

  submitJoinUs() {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    const payload: any = {
      firstName: this.joinUsData.firstName,
      lastName: this.joinUsData.lastName,
      email: this.joinUsData.email,
      password: this.joinUsData.password,
      phone: this.joinUsData.phone,
      role: this.joinUsData.role,
      department: this.joinUsData.department,
      designation: this.joinUsData.designation,
      joiningDate: this.joinUsData.joiningDate
    };

    if (this.joinUsData.role === 'Doctor') {
      payload.specialization = this.joinUsData.specialization;
      payload.qualification = this.joinUsData.qualification;
      payload.consultationFee = this.joinUsData.consultationFee;
      payload.medicalRegistrationNo = this.joinUsData.medicalRegistrationNo;
      payload.availabilityStartTime = this.joinUsData.availabilityStartTime;
      payload.availabilityEndTime = this.joinUsData.availabilityEndTime;
      payload.experienceYears = this.joinUsData.experienceYears;
    }

    this.auth.joinUs(payload).subscribe({
      next: (res: any) => {
        console.log('Join Us response:', res);

        this.successMessage =
          res.message ||
          'Join request submitted. Please verify your email using the localhost verification link from backend console.';

        this.isSubmitting = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.log('Join Us error:', err);

        this.errorMessage = err.error?.message || 'Failed to submit join request';

        this.isSubmitting = false;
        this.cd.detectChanges();
      }
    });
  }

  resetEmailCheck() {
    this.emailChecked = false;
    this.successMessage = '';
    this.errorMessage = '';

    this.joinUsData.email = '';
  }
  departments = [
  'OPD',
  'IPD',
  'Lab',
  'Pharmacy',
  'Admin',
  'Front Office'
];

designations = [
  'Jr Doctor',
  'Nurse',
  'Receptionist',
  'Administrator'
];
}