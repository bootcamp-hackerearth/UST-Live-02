import { Component, ChangeDetectorRef, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-doctor-queue',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonLoaderComponent],
  templateUrl: './doctor-queue.html',
  styleUrls: ['./doctor-queue.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorQueue {
  appointments: any[] = [];

  isLoading = false;

  doctorEmployeeId = '';

  constructor(
    private readonly appointmentService: AppointmentService,
    public authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toast: ToastService
  ) {
    effect(() => {
      const user = this.authService.currentUser();
      const doctorEmployeeId = user?.employeeId?._id || '';

      if (doctorEmployeeId && doctorEmployeeId !== this.doctorEmployeeId) {
        this.doctorEmployeeId = doctorEmployeeId;
        this.loadQueue();
      }
    });
  }

  // Fetch doctor's appointment queue
  loadQueue(): void {
    this.isLoading = true;

    this.appointmentService.getDoctorQueue(this.doctorEmployeeId).subscribe({
      next: (response) => {
        console.log(response);

        this.appointments = response.data;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);

        this.isLoading = false;
      }
    });
  }

  // Mark appointment as completed
  markCompleted(appointment: any): void {
    const updatedData = {
      ...appointment,
      status: 'COMPLETED'
    };

    this.appointmentService.updateAppointment(appointment._id, updatedData).subscribe({
      next: (response) => {
        console.log(response);

        this.toast.success('Consultation completed');

        this.loadQueue();
      },
      error: (error) => {
        console.log(error);
        this.toast.error('Unable to complete consultation');
      }
    });
  }

  // Move appointment to consultation state
  startConsultation(appointment: any): void {
    const updatedData = {
      ...appointment,
      status: 'IN_CONSULTATION'
    };

    this.appointmentService.updateAppointment(appointment._id, updatedData).subscribe({
      next: (response) => {
        console.log(response);

        this.toast.success('Consultation started');

        this.loadQueue();
      },
      error: (error) => {
        console.log(error);
        this.toast.error('Unable to start consultation');
      }
    });
  }
}
