import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  apiUrl = 'http://localhost:5000/api/appointments';

  constructor(private readonly http: HttpClient) {}

  // Get available slots for a doctor
  getAvailableSlots(
    doctorId: string,
    appointmentDate: string
  ): Observable<any> {
    return this.http.get(`${this.apiUrl}/available-slots`, {
      params: {
        doctorId,
        appointmentDate
      }
    });
  }

  // Create a new appointment
  bookAppointment(appointmentData: any): Observable<any> {
    return this.http.post(this.apiUrl, appointmentData);
  }

  // Get all appointments
  getAppointments(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Delete an appointment
  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get appointment details by ID
  getAppointmentById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Update an existing appointment
  updateAppointment(
    id: string,
    appointmentData: any
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, appointmentData);
  }

  // Get today's queue for a doctor
  getDoctorQueue(doctorEmployeeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctor-queue`, {
      params: {
        doctorEmployeeId
      }
    });
  }
  // Get pending appointments
getPendingAppointments(): Observable<any> {
  return this.http.get(
    `${this.apiUrl}/pending`
  );
}

// Approve appointment
approveAppointment(
  id: string
): Observable<any> {
  return this.http.patch(
    `${this.apiUrl}/${id}/approve`,
    {}
  );
}

// Reject appointment
rejectAppointment(
  id: string
): Observable<any> {
  return this.http.patch(
    `${this.apiUrl}/${id}/reject`,
    {}
  );
}
}
