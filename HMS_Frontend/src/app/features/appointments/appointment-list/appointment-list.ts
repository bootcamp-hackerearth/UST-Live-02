import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentList implements OnInit {
  appointments: any[] = [];

  search = '';
  status = '';
  priority = '';
  startDate = '';
  endDate = '';
  page = 1;
  limit = 10;

  totalRecords = 0;
  totalPages = 0;

  constructor(
    private readonly appointmentService: AppointmentService,
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const params: any = {
      page: this.page,
      limit: this.limit
    };

    if (this.search.trim()) {
      params.search = this.search;
    }

    if (this.status) {
      params.status = this.status;
    }

    if (this.priority) {
      params.priority = this.priority;
    }

    if (this.startDate) {
      params.startDate = this.startDate;
    }

    if (this.endDate) {
      params.endDate = this.endDate;
    }

    this.appointmentService.getAppointments(params).subscribe({
      next: (response) => {
        this.appointments = response.data;

        this.totalRecords = response.meta?.total || 0;

        this.totalPages = response.meta?.totalPages || 0;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log(error);
      }
    });
  }
  onFilterChange(): void {
    this.page = 1;

    this.loadAppointments();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;

      this.loadAppointments();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;

      this.loadAppointments();
    }
  }

  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.limit = Number(select.value);

    this.page = 1;

    this.loadAppointments();
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
