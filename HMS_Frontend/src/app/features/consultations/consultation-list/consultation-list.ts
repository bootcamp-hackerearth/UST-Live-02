import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee';
import { PatientService } from '../../../core/services/patient';
import { ConsultationService } from '../../../core/services/consultation';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  templateUrl: './consultation-list.html',
  styleUrls: ['./consultation-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationList implements OnInit {
  consultations: any[] = [];

  meta: any = {};

  search = '';
  doctor = '';
  patient = '';
  status = '';

  startDate = '';
  endDate = '';

  page = 1;
  limit = 10;

  doctors: any[] = [];
  patients: any[] = [];

  isLoading = false;

  constructor(
    private readonly consultationService: ConsultationService,
    private readonly employeeService: EmployeeService,
    private readonly patientService: PatientService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load consultations on page load
  ngOnInit(): void {
    this.loadDoctors();
    this.loadPatients();
    this.loadConsultations();
  }
  loadDoctors(): void {
    this.employeeService.getDoctors().subscribe({
      next: (response) => {
        this.doctors = response.data;
      }
    });
  }
  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response) => {
        this.patients = response.data;
      }
    });
  }
  // Fetch all consultations
  loadConsultations(showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading = true;
    }

    const params: any = {
      page: this.page,
      limit: this.limit
    };

    if (this.search) {
      params.search = this.search;
    }

    if (this.doctor) {
      params.doctor = this.doctor;
    }

    if (this.patient) {
      params.patient = this.patient;
    }

    if (this.status) {
      params.status = this.status;
    }

    if (this.startDate) {
      params.startDate = this.startDate;
    }

    if (this.endDate) {
      params.endDate = this.endDate;
    }

    this.consultationService.getConsultations(params).subscribe({
      next: (response) => {
        this.consultations = response.data;

        this.meta = response.meta;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log(error);

        this.isLoading = false;
      }
    });
  }
  onFilterChange(): void {
    this.page = 1;

    this.loadConsultations(false);
  }
  previousPage(): void {
    if (this.page <= 1) {
      return;
    }

    this.page--;

    this.loadConsultations(false);
  }

  nextPage(): void {
    if (this.page >= this.meta.totalPages) {
      return;
    }

    this.page++;

    this.loadConsultations(false);
  }
  // Download prescription PDF
  downloadPdf(consultationId: string): void {
    this.consultationService.downloadPrescriptionPdf(consultationId).subscribe({
      next: (response: Blob) => {
        const fileURL = globalThis.URL.createObjectURL(response);

        globalThis.open(fileURL);
      },

      error: (error) => {
        console.log(error);
      }
    });
  }
}
