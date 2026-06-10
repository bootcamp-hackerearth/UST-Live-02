import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.css']
})
export class AppointmentList implements OnInit {
  appointments: any[] = [];

  filteredAppointments: any[] = [];

  searchTerm = '';

  selectedStatus = '';

  constructor(
    private readonly appointmentService: AppointmentService,
    public readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        this.appointments = response.data;
        this.filteredAppointments = response.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log(error);
      }
    });
  }

  filterAppointments(): void {
    this.filteredAppointments = this.appointments.filter((appointment) => {
      const patientName =
        `${appointment?.patientId?.firstName} ${appointment?.patientId?.lastName}`.toLowerCase();

      const doctorName =
        appointment?.doctorEmployeeId?.name?.toLowerCase();

      const matchesSearch =
        patientName.includes(this.searchTerm.toLowerCase()) ||
        doctorName.includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.selectedStatus === '' ||
        appointment.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  deleteAppointment(id: string): void {
    const confirmDelete = confirm('Delete this appointment?');

    if (!confirmDelete) {
      return;
    }

    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => {
        alert('Appointment deleted successfully');

        this.loadAppointments();
      },

      error: (error) => {
        console.log(error);
      }
    });
  }
}