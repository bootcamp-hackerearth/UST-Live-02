import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Appointment, CreateAppointmentPayload,SlotResponse } from '../models/appointments.model';
import { Patient } from '../models/patients.model';
import { ApiResponse } from '../models/api-response.model';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  readonly baseUrl = environment.apiUrl;

  constructor(readonly http: HttpClient) {}

  getAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.baseUrl}/appointments/list`);
  }

  createAppointment(payload: CreateAppointmentPayload): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${this.baseUrl}/appointments/create`, payload);
  }

  getPatients(): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(`${this.baseUrl}/patients/list`);
  }

   getDoctors(): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(`${this.baseUrl}/doctors/list`);
  }

  getAvailableSlots(doctorId: string, appointmentDate: string): Observable<ApiResponse<SlotResponse>> {
    return this.http.get<ApiResponse<SlotResponse>>(
      `${this.baseUrl}/appointments/available-slots?doctorId=${doctorId}&appointmentDate=${appointmentDate}`
    );
}

 getMyAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.baseUrl}/appointments/my-appointments`
    );
  }

  cancelAppointment(appointmentId: string) {
  return this.http.put(
    `${this.baseUrl}/appointments/cancel/${appointmentId}`,
    {}
  );
}

}