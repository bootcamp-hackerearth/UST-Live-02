import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
  consultation: any;

  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly consultationService: ConsultationService,
    private readonly cdr: ChangeDetectorRef
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

        this.consultation = response.data;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);

        this.isLoading = false;
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
    this.consultationService.downloadPrescriptionPdf(this.consultation._id).subscribe({
      next: (response: Blob) => {
        const fileURL = globalThis.URL.createObjectURL(response);

        globalThis.open(fileURL);
      }
    });
  }
}
