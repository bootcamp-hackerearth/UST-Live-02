import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ConsultationService } from '../../../core/services/consultation';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consultation-list.html',
  styleUrls: ['./consultation-list.css']
})
export class ConsultationList implements OnInit {
  consultations: any[] = [];

  isLoading = false;

  constructor(
    private readonly consultationService: ConsultationService
  ) {}

  // Load consultations on page load
  ngOnInit(): void {
    this.loadConsultations();
  }

  // Fetch all consultations
  loadConsultations(): void {
    this.isLoading = true;

    this.consultationService.getConsultations().subscribe({
      next: (response) => {
        console.log(response);

        this.consultations = response.data;

        this.isLoading = false;
      },

      error: (error) => {
        console.log(error);

        this.isLoading = false;
      }
    });
  }

  // Download prescription PDF
  downloadPdf(consultationId: string): void {
    this.consultationService
      .downloadPrescriptionPdf(consultationId)
      .subscribe({
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