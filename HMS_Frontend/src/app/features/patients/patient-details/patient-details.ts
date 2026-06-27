import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { PatientService } from '../../../core/services/patient';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-details.html',
  styleUrls: ['./patient-details.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDetails implements OnInit {
  patient: any = {};

  constructor(
    private readonly route: ActivatedRoute,
    private readonly patientService: PatientService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Load patient details on page load
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.loadPatient(id);
  }

  // Get patient details
  loadPatient(id: string): void {
    this.patientService.getPatientById(id).subscribe({
      next: (response) => {
        console.log(response);

        this.patient = response.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log(error);
      }
    });
  }
}
