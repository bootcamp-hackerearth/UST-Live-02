import { Injectable } from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Appointment, CreateAppointmentPayload,SlotResponse,PaginatedAppointmentResponse } from '../models/appointments.model';
import { Patient } from '../models/patients.model';
import { ApiResponse } from '../models/api-response.model';
import { Doctor } from '../models/doctor.model';
import { AppointmentDetailsResponse } from '../models/appointment-details.model';
import { PaginatedResponse } from '../models/pagination.model';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  readonly baseUrl = environment.apiUrl;

  constructor(readonly http: HttpClient) {}

getAppointments(
  page: number,
  limit: number,
  search: string
): Observable<PaginatedAppointmentResponse> {
  const params = new HttpParams()
    .set('page', page)
    .set('limit', limit)
    .set('search', search);

  return this.http.get<PaginatedAppointmentResponse>(
    `${this.baseUrl}/appointments/list`,
    { params }
  );
}

  createAppointment(payload: CreateAppointmentPayload): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${this.baseUrl}/appointments/create`, payload);
  }

getPatients(): Observable<PaginatedResponse<Patient>> {
  const params = new HttpParams()
    .set('page', '1')
    .set('limit', '100')
    .set('search', '');

  return this.http.get<PaginatedResponse<Patient>>(
    `${this.baseUrl}/patients/list`,
    { params }
  );
}
  getDoctors(): Observable<PaginatedResponse<Doctor>> {
  const params = new HttpParams()
    .set('page', '1')
    .set('limit', '100')
    .set('search', '');

  return this.http.get<PaginatedResponse<Doctor>>(
    `${this.baseUrl}/doctors/list`,
    { params }
  );
}

  getAvailableSlots(doctorId: string, appointmentDate: string): Observable<ApiResponse<SlotResponse>> {
    return this.http.get<ApiResponse<SlotResponse>>(
      `${this.baseUrl}/appointments/available-slots?doctorId=${doctorId}&appointmentDate=${appointmentDate}`
    );
}

getMyAppointments(
  page: number,
  limit: number,
  search: string
): Observable<PaginatedAppointmentResponse> {
  const params = new HttpParams()
    .set('page', page)
    .set('limit', limit)
    .set('search', search);

  return this.http.get<PaginatedAppointmentResponse>(
    `${this.baseUrl}/appointments/my-appointments`,
    { params }
  );
}

cancelAppointment(appointmentId: string) {
  return this.http.put(
    `${this.baseUrl}/appointments/cancel/${appointmentId}`,
    {}
  );
}

markAsUnattended(appointmentId: string) {
  return this.http.put(
    `${this.baseUrl}/appointments/unattended/${appointmentId}`,
    {}
  );
}

getAppointmentDetails(id: string): Observable<AppointmentDetailsResponse> {
  return this.http.get<AppointmentDetailsResponse>(
    `${this.baseUrl}/appointments/details/${id}`
  );
}
}