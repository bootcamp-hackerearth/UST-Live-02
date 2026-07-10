import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(private readonly http: HttpClient) {}

  // Get available slots for a doctor
  getAvailableSlots(doctorId: string, appointmentDate: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/appointments/available-slots`, {
      params: {
        doctorId,
        appointmentDate
      }
    });
  }

  // Create a new appointment
  bookAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`${API_BASE_URL}/appointments`, appointmentData);
  }

  // Get all appointments
  getAppointments(params?: any): Observable<any> {
    return this.http.get(`${API_BASE_URL}/appointments`, { params });
  }

  // Get appointment details by ID
  getAppointmentById(id: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/appointments/${id}`);
  }

  // Update appointment details
  updateAppointment(id: string, appointmentData: any): Observable<any> {
    return this.http.put(`${API_BASE_URL}/appointments/${id}`, appointmentData);
  }

  // Delete appointment
  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${API_BASE_URL}/appointments/${id}`);
  }

  // Get today's doctor queue
  getDoctorQueue(doctorEmployeeId: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/appointments/doctor-queue`, {
      params: {
        doctorEmployeeId
      }
    });
  }

  // Get pending appointments
  getPendingAppointments(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/appointments/pending`);
  }

  // Approve appointment
  approveAppointment(id: string): Observable<any> {
    return this.http.patch(`${API_BASE_URL}/appointments/${id}/approve`, {});
  }

  // Reject appointment
  rejectAppointment(id: string): Observable<any> {
    return this.http.patch(`${API_BASE_URL}/appointments/${id}/reject`, {});
  }
}
