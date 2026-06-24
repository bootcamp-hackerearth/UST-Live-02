import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/ui/dashboard-layout/dashboard-layout';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiErrorHandlerService } from '../../../core/services/api-error-handler.service';
import { APP_MESSAGES } from '../../../core/constants/messages';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import {
  Appointment,
  APPOINTMENT_STATUSES,
} from '../../../core/models/appointment.model';
import { todayIsoDate } from '../../../core/validators/app-validators';

type DoctorTab = 'today' | 'upcoming' | 'past' | 'completed';

// Role-aware appointments list (reception sees all; doctor sees own by tab)
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DashboardLayoutComponent,
    DatePipe,
  ],
  templateUrl: './appointments-list.html',
  styleUrl: './appointments-list.css',
})
export class AppointmentsListComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly apiError = inject(ApiErrorHandlerService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = signal(true);
  appointments = signal<Appointment[]>([]);

  // Row action in flight; all row buttons disable while set
  busyId = signal<string | null>(null);
  busyAction = signal<'cancel' | null>(null);

  statuses = APPOINTMENT_STATUSES;
  statusFilter = signal<string>('');
  dateFilter = signal<string>('');

  // Doctor tabs
  doctorTab = signal<DoctorTab>('today');
  todayIso = todayIsoDate();

  // Pagination (reception view)
  page = signal(1);
  limit = 10;
  totalPages = signal(1);
  total = signal(0);

  isDoctor = computed(() => this.authService.getDesignation() === 'DOCTOR');
  hasReceptionAccess = computed(() => {
    const d = this.authService.getDesignation();
    return (
      d === 'OWNER' || d === 'ADMIN' || d === 'RECEPTIONIST'
    );
  });

  // Doctor tab badge counts (server totals, independent of the current page)
  tabCounts = signal<Record<DoctorTab, number>>({
    today: 0,
    upcoming: 0,
    past: 0,
    completed: 0,
  });

  doctorTabCount(tab: DoctorTab): number {
    return this.tabCounts()[tab];
  }

  // Pull the four doctor tab counts from the dashboard stats endpoint
  private loadTabCounts(): void {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        const s = res.data.stats;
        this.tabCounts.set({
          today: s.today ?? 0,
          upcoming: s.upcoming ?? 0,
          past: s.pastDue ?? 0,
          completed: s.completed ?? 0,
        });
      },
      error: () => {
        // Badge counts are non-critical; leave them at their last values
      },
    });
  }

  // True once the slot start time has passed (mirrors detail view + backend guard)
  startTimePassed(a: Appointment): boolean {
    const start = (a.timeSlot || '').split('-')[0];
    const [hh, mm] = (start || '').split(':').map(Number);
    const startAt = new Date(a.appointmentDate);
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
      startAt.setHours(hh, mm, 0, 0);
    }
    return startAt.getTime() <= Date.now();
  }

  ngOnInit(): void {
    // Preselect a doctor tab from ?tab=today|upcoming|completed
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (
      tab === 'today' ||
      tab === 'upcoming' ||
      tab === 'past' ||
      tab === 'completed'
    ) {
      this.doctorTab.set(tab);
    }
    // Reception/admin status filter deep link via ?status=BOOKED etc
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status) {
      this.statusFilter.set(status);
    }
    // Doctor tab badge counts come from the dashboard stats endpoint
    if (this.isDoctor()) {
      this.loadTabCounts();
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);

    if (this.isDoctor()) {
      // Server-side per-tab pagination for the doctor view
      this.appointmentService
        .getMyAppointments(this.page(), this.limit, { tab: this.doctorTab() })
        .subscribe({
          next: (res) => {
            this.appointments.set(res.data.appointments || []);
            this.totalPages.set(res.data.totalPages || 1);
            this.total.set(res.data.total || 0);
            // Re-clamp if the current page fell past the end after a shrink
            if (this.total() > 0 && this.page() > this.totalPages()) {
              this.page.set(this.totalPages());
              this.load();
              return;
            }
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.toast.error(APP_MESSAGES.LOAD_APPOINTMENTS_FAILED);
          },
        });
      return;
    }

    this.appointmentService
      .getAppointments(this.page(), this.limit, {
        status: this.statusFilter() || undefined,
        date: this.dateFilter() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.appointments.set(res.data.appointments || []);
          this.totalPages.set(res.data.totalPages || 1);
          this.total.set(res.data.total || 0);
          // Re-clamp if the current page fell past the end after a shrink
          if (this.total() > 0 && this.page() > this.totalPages()) {
            this.page.set(this.totalPages());
            this.load();
            return;
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error(APP_MESSAGES.LOAD_APPOINTMENTS_FAILED);
        },
      });
  }

  switchTab(tab: DoctorTab): void {
    if (tab === this.doctorTab()) {
      return;
    }
    this.doctorTab.set(tab);
    this.page.set(1);
    this.load();
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.load();
  }

  onDateChange(value: string): void {
    this.dateFilter.set(value);
    this.page.set(1);
    this.load();
  }

  clearDate(): void {
    this.dateFilter.set('');
    this.page.set(1);
    this.load();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  open(a: Appointment): void {
    this.router.navigate(['/dashboard/appointments', a.appointmentId]);
  }

  async cancel(a: Appointment, event: Event): Promise<void> {
    event.stopPropagation();
    const result = await this.confirmModal.open({
      title: 'Cancel Appointment',
      message: `Cancel appointment ${a.appointmentId}? The slot will become available again.`,
      confirmText: 'Cancel It',
      cancelText: 'Keep',
      type: 'danger',
      showInput: true,
      inputLabel: 'Cancellation Reason',
      inputPlaceholder: 'Reason for cancelling this appointment',
    });
    if (!result.confirmed) {
      return;
    }
    const reason = (result.inputValue ?? '').trim();
    this.busyId.set(a.appointmentId);
    this.busyAction.set('cancel');
    this.appointmentService.cancelAppointment(a.appointmentId, reason).subscribe({
      next: (res) => {
        this.clearBusy();
        this.toast.success(res.message || APP_MESSAGES.APPOINTMENT_CANCELLED);
        this.load();
      },
      error: (err) => {
        this.clearBusy();
        this.toast.error(this.apiError.message(err, APP_MESSAGES.APPOINTMENT_CANCEL_FAILED));
      },
    });
  }

  private clearBusy(): void {
    this.busyId.set(null);
    this.busyAction.set(null);
  }

  trackById = (_: number, a: Appointment) => a.appointmentId;
}
