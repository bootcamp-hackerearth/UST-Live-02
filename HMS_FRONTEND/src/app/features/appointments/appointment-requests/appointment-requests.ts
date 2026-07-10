import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  readonly appointments = signal<any[]>([]);
  readonly loading = signal(false);

  constructor(
    private readonly appointmentService: AppointmentService,
    public readonly nodeService: NodeService
  ) {}

  ngOnInit(): void {
    this.loadPendingAppointments();
  }

  loadPendingAppointments(): void {
    this.loading.set(true);

    this.appointmentService.getPendingAppointments().subscribe({
      next: (response) => {
        this.appointments.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
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
