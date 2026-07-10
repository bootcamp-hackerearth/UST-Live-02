import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { NodeService } from '../../../core/services/node';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentList implements OnInit, OnDestroy {
  appointments: any[] = [];

  search = '';
  status = '';
  priority = '';
  startDate = '';
  endDate = '';
  page = 1;
  limit = 10;
  cursorStack: string[] = [''];
  nextCursor = '';

  totalRecords = 0;
  totalPages = 0;

  private readonly searchInput$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly appointmentService: AppointmentService,
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly confirmDialog: ConfirmDialogService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.reloadFromFirstPage());

    this.applyAppointmentsResponse(this.route.snapshot.data['appointments']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAppointments(): void {
    const params: any = {
      page: this.page,
      limit: this.limit,
      pagination: 'cursor',
      cursor: this.cursorStack[this.page - 1] || ''
    };

    if (this.search.trim()) {
      params.search = this.search.trim();
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
        this.applyAppointmentsResponse(response);

        if (this.page > 1 && this.appointments.length === 0) {
          this.page = Math.max(this.totalPages || 1, 1);
          this.loadAppointments();
          return;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
  onSearchInput(): void {
    this.searchInput$.next(this.search.trim());
  }

  onFilterChange(): void {
    this.reloadFromFirstPage();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;

      this.loadAppointments();
    }
  }

  nextPage(): void {
    if (this.nextCursor) {
      this.cursorStack[this.page] = this.nextCursor;
      this.page++;

      this.loadAppointments();
    }
  }

  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.limit = Number(select.value);

    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';

    this.loadAppointments();
  }

  async deleteAppointment(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete appointment?',
      message: 'This appointment will be removed from the schedule.',
      confirmText: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => {
        this.page = this.getPageAfterDelete();
        this.toast.success('Appointment deleted successfully');

        this.loadAppointments();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  private reloadFromFirstPage(): void {
    this.resetPagination();
    this.loadAppointments();
  }

  private resetPagination(): void {
    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';
  }

  private getPageAfterDelete(): number {
    const totalAfterDelete = Math.max(this.totalRecords - 1, 0);
    const totalPagesAfterDelete = Math.max(Math.ceil(totalAfterDelete / this.limit), 1);

    return Math.min(this.page, totalPagesAfterDelete);
  }

  private applyAppointmentsResponse(response: any): void {
    this.appointments = response?.data || [];
    this.totalRecords = response?.meta?.totalRecords ?? response?.meta?.total ?? 0;
    this.totalPages = response?.meta?.totalPages || Math.max(Math.ceil(this.totalRecords / this.limit), 1);
    this.nextCursor = response?.meta?.nextCursor || '';
  }
}



