import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.css']
})
export class PatientList implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];

  searchTerm = '';
  userRole = '';

  constructor(
    private readonly patientService: PatientService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load patients on page load
  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || '';

    console.log('ROLE:', this.userRole);

    this.loadPatients();
  }

  // Get all patients
  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response) => {
        console.log(response);

        this.patients = response.data;
        this.filteredPatients = response.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log(error);
      }
    });
  }

  // Search patients
  searchPatients(): void {
    const search = this.searchTerm.toLowerCase();

    this.filteredPatients = this.patients.filter((patient) => {
      return (
        patient.firstName?.toLowerCase().includes(search) ||
        patient.lastName?.toLowerCase().includes(search) ||
        patient.patientId?.toLowerCase().includes(search) ||
        patient.phone?.includes(search)
      );
    });
  }
}