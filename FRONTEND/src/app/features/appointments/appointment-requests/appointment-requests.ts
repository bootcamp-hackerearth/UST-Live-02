import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-appointment-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-requests.html',
  styleUrls: ['./appointment-requests.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentRequestsComponent implements OnInit {
  appointments: any[] = [];

  loading = false;

  constructor(
    private readonly appointmentService: AppointmentService,
    public readonly nodeService: NodeService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.appointments = this.route.snapshot.data['pendingAppointments']?.data || [];
  }

  loadPendingAppointments(): void {
    this.loading = true;

    this.appointmentService.getPendingAppointments().subscribe({
      next: (response) => {
        this.appointments = response.data;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  approve(id: string): void {
    this.appointmentService.approveAppointment(id).subscribe({
      next: () => {
        this.loadPendingAppointments();
      }
    });
  }

  reject(id: string): void {
    this.appointmentService.rejectAppointment(id).subscribe({
      next: () => {
        this.loadPendingAppointments();
      }
    });
  }
}
