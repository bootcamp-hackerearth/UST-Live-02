import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment';
import { ToastService } from '../../../core/services/toast';
@Component({
  selector: 'app-pending-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-appointments.html',
  styleUrls: ['./pending-appointments.css']
})
export class PendingAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  isLoading = true;
  actionLoadingId: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private toast: ToastService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPendingAppointments();
  }

  loadPendingAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getPendingAppointments().subscribe({
      next: (res) => {
        this.appointments = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Failed to load pending appointments', 'error');
        this.isLoading = false;
      }
    });
  }

  approve(id: string): void {
    this.actionLoadingId = id;
    this.appointmentService.approveAppointment(id).subscribe({
      next: () => {
        this.toast.show('Appointment approved successfully', 'success');
        this.appointments = this.appointments.filter(a => a._id !== id);
        this.actionLoadingId = null;
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Failed to approve appointment', 'error');
        this.actionLoadingId = null;
      }
    });
  }

  reject(id: string): void {
    this.actionLoadingId = id;
    this.appointmentService.rejectAppointment(id).subscribe({
      next: () => {
        this.toast.show('Appointment rejected successfully', 'success');
        this.appointments = this.appointments.filter(a => a._id !== id);
        this.actionLoadingId = null;
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Failed to reject appointment', 'error');
        this.actionLoadingId = null;
      }
    });
  }

  getPatientName(appt: any): string {
    const p = appt.patientId;
    return p ? `${p.firstName} ${p.lastName}` : 'N/A';
  }

  getDoctorName(appt: any): string {
    const d = appt.doctorEmployeeId;
    return d ? `Dr. ${d.firstName} ${d.lastName}` : 'N/A';
  }
}
