import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AppointmentService } from '../core/services/appointment';
import { ConsultationService } from '../core/services/consultation';
import { EmployeeService } from '../core/services/employee';
import { HealthRecordService } from '../core/services/health-record';
import { NodeService } from '../core/services/node';
import { PatientService } from '../core/services/patient';

const cursorParams = {
  page: 1,
  limit: 10,
  pagination: 'cursor',
  cursor: ''
};

export const patientsResolver: ResolveFn<any> = () =>
  inject(PatientService)
    .getPatients(cursorParams)
    .pipe(catchError(() => of({ data: [], meta: {} })));

export const employeesResolver: ResolveFn<any> = () =>
  inject(EmployeeService)
    .getEmployees(cursorParams)
    .pipe(catchError(() => of({ data: [], meta: {} })));

export const appointmentsResolver: ResolveFn<any> = () =>
  inject(AppointmentService)
    .getAppointments(cursorParams)
    .pipe(catchError(() => of({ data: [], meta: {} })));

export const managementNodesResolver: ResolveFn<any> = () =>
  inject(NodeService)
    .getManagementNodes()
    .pipe(catchError(() => of({ data: [] })));

export const pendingAppointmentsResolver: ResolveFn<any> = () =>
  inject(AppointmentService)
    .getPendingAppointments()
    .pipe(catchError(() => of({ data: [] })));

export const pendingEmployeesResolver: ResolveFn<any> = () =>
  inject(EmployeeService)
    .getPendingEmployees()
    .pipe(catchError(() => of({ data: [] })));

export const healthRecordsResolver: ResolveFn<any> = () =>
  inject(HealthRecordService)
    .getHealthRecords(cursorParams)
    .pipe(catchError(() => of({ data: [], meta: {} })));

export const consultationsResolver: ResolveFn<any> = () =>
  inject(ConsultationService)
    .getConsultations(cursorParams)
    .pipe(catchError(() => of({ data: [], meta: {} })));

export const consultationFiltersResolver: ResolveFn<any> = () => {
  const employeeService = inject(EmployeeService);
  const patientService = inject(PatientService);

  return forkJoin({
    doctors: employeeService.getDoctors().pipe(catchError(() => of({ data: [] }))),
    patients: patientService.getPatients().pipe(catchError(() => of({ data: [] })))
  });
};
