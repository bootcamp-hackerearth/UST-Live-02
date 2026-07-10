import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, timer, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { NodeService } from '../../../core/services/node';
import { DashboardService } from '../../../core/services/dashboard';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboard implements OnInit, OnDestroy {
  stats: any = {};

  recentEmployees: any[] = [];

  auditLogs: any[] = [];

  private auditLogSubscription?: Subscription;

  constructor(
    public readonly authService: AuthService,
    public readonly nodeService: NodeService,
    private readonly route: ActivatedRoute,
    private readonly dashboardService: DashboardService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const dashboard = this.route.snapshot.data['dashboard'];

    this.stats = dashboard?.stats?.data || {};
    this.recentEmployees = dashboard?.recentEmployees?.data || [];
    this.auditLogs = dashboard?.auditLogs?.data || [];
    this.startAuditLogPolling();
  }

  ngOnDestroy(): void {
    this.auditLogSubscription?.unsubscribe();
  }

  getActorName(log: any): string {
    return log?.performedBy?.employeeId?.name || log?.performedBy?.email || 'System';
  }

  getAuditSummary(log: any): string {
    return `${log?.action || 'Action'} ${log?.entityType || log?.module || 'record'}`;
  }

  private startAuditLogPolling(): void {
    this.auditLogSubscription = timer(5000, 5000)
      .pipe(switchMap(() => this.dashboardService.getAuditLogs()))
      .subscribe({
        next: (response) => {
          this.auditLogs = response?.data || [];
          this.cdr.markForCheck();
        }
      });
  }
}
