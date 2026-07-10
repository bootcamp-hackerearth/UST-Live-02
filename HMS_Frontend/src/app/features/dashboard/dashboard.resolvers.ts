import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard';

export const adminDashboardResolver: ResolveFn<any> = () => {
  const dashboardService = inject(DashboardService);

  return forkJoin({
    stats: dashboardService.getAdminStats().pipe(catchError(() => of({ data: {} }))),
    recentEmployees: dashboardService.getRecentEmployees().pipe(catchError(() => of({ data: [] }))),
    auditLogs: dashboardService.getAuditLogs().pipe(catchError(() => of({ data: [] })))
  });
};

export const doctorDashboardResolver: ResolveFn<any> = () => {
  const dashboardService = inject(DashboardService);

  return forkJoin({
    stats: dashboardService.getDoctorStats().pipe(catchError(() => of({ data: {} }))),
    todayAppointments: dashboardService.getTodayAppointments().pipe(catchError(() => of({ data: [] })))
  });
};

export const receptionistDashboardResolver: ResolveFn<any> = () => {
  const dashboardService = inject(DashboardService);

  return forkJoin({
    stats: dashboardService.getReceptionistStats().pipe(catchError(() => of({ data: {} }))),
    todayAppointments: dashboardService.getTodayAppointments().pipe(catchError(() => of({ data: [] })))
  });
};
