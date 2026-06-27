import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  apiUrl = `${API_BASE_URL}/appointments`;

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
  getAppointments(page = 1, limit = 10, filters: any = {}): Observable<any> {
    const params: any = {
      page,
      limit
    };

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.fromDate) {
      params.fromDate = filters.fromDate;
    }

    if (filters.toDate) {
      params.toDate = filters.toDate;
    }

    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder || 'asc';
    }

    return this.http.get(this.apiUrl, { params });
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
  getPendingAppointments(page = 1, limit = 10, filters: any = {}): Observable<any> {
    const params: any = {
      page,
      limit
    };

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.fromDate) {
      params.fromDate = filters.fromDate;
    }

    if (filters.toDate) {
      params.toDate = filters.toDate;
    }

    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder || 'desc';
    }

    return this.http.get(`${this.apiUrl}/pending`, { params });
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
