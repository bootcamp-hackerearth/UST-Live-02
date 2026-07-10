import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  readonly appointments = signal<any[]>([]);
  readonly search = signal('');
  readonly status = signal('');
  readonly priority = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly cursorStack = signal<string[]>(['']);
  readonly nextCursor = signal('');
  readonly totalRecords = signal(0);
  readonly totalPages = signal(0);

  private readonly destroy$ = new Subject<void>();
  protected readonly searchDebounce$ = new Subject<void>();

  constructor(
    private readonly appointmentService: AppointmentService,
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly confirmDialog: ConfirmDialogService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.searchDebounce$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => this.onFilterChange());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAppointments(): void {
    const params: any = {
      page: this.page(),
      limit: this.limit(),
      pagination: 'cursor',
      cursor: this.cursorStack()[this.page() - 1] || ''
    };

    if (this.search().trim()) {
      params.search = this.search();
    }

    if (this.status()) {
      params.status = this.status();
    }

    if (this.priority()) {
      params.priority = this.priority();
    }

    if (this.startDate()) {
      params.startDate = this.startDate();
    }

    if (this.endDate()) {
      params.endDate = this.endDate();
    }

    this.appointmentService.getAppointments(params).subscribe({
      next: (response) => {
        this.appointments.set(response.data);

        this.totalRecords.set(response.meta?.totalRecords ?? response.meta?.total ?? 0);

        this.totalPages.set(response.meta?.totalPages || Math.max(Math.ceil(this.totalRecords() / this.limit()), 1));
        this.nextCursor.set(response.meta?.nextCursor || '');

        if (this.page() > 1 && this.appointments().length === 0) {
          this.page.set(Math.max(this.totalPages() || 1, 1));
          this.loadAppointments();
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onFilterChange(): void {
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');
    this.loadAppointments();
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadAppointments();
    }
  }

  nextPage(): void {
    if (this.nextCursor()) {
      const stack = [...this.cursorStack()];
      stack[this.page()] = this.nextCursor();
      this.cursorStack.set(stack);
      this.page.update(p => p + 1);
      this.loadAppointments();
    }
  }

  onPageSizeChange(newLimit: number): void {
    this.limit.set(newLimit);
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');
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
        this.page.set(this.getPageAfterDelete());
        this.toast.success('Appointment deleted successfully');
        this.loadAppointments();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  private getPageAfterDelete(): number {
    const totalAfterDelete = Math.max(this.totalRecords() - 1, 0);
    const totalPagesAfterDelete = Math.max(Math.ceil(totalAfterDelete / this.limit()), 1);
    return Math.min(this.page(), totalPagesAfterDelete);
  }
}
