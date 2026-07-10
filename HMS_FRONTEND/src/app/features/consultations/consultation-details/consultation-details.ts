import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ConsultationService } from '../../../core/services/consultation';

@Component({
  selector: 'app-consultation-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-details.html',
  styleUrls: ['./consultation-details.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationDetails implements OnInit {
  readonly consultation = signal<any>(null);
  readonly isLoading = signal(true);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadConsultation(id);
    }
  }

  // Load consultation details
  loadConsultation(id: string): void {
    this.consultationService.getConsultationById(id).subscribe({
      next: (response) => {
        console.log(response);

        this.consultation.set(response.data);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.log(error);

        this.isLoading.set(false);
      }
    });
  }

  // Print consultation details
  printPage(): void {
    document.title = 'Prescription';
    globalThis.print();
  }

  // Download prescription PDF
  downloadPdf(): void {
    this.consultationService.downloadPrescriptionPdf(this.consultation()._id).subscribe({
      next: (response: Blob) => {
        const fileURL = globalThis.URL.createObjectURL(response);

        globalThis.open(fileURL);
      }
    });
  }
}
