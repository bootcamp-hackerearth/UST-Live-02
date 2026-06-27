import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  // Get admin dashboard statistics
  getAdminStats(): Observable<any> {
    return this.http.get(
      `${API_BASE_URL}/dashboard/admin-stats`
    );
  }

  // Get recently added employees
  getRecentEmployees(): Observable<any> {
    return this.http.get(
      `${API_BASE_URL}/dashboard/recent-employees`
    );
  }

  // Get doctor dashboard statistics
  getDoctorStats(): Observable<any> {
    return this.http.get(
      `${API_BASE_URL}/dashboard/doctor-stats`
    );
  }

  // Get receptionist dashboard statistics
  getReceptionistStats(): Observable<any> {
    return this.http.get(
      `${API_BASE_URL}/dashboard/receptionist-stats`
    );
  }

  // Get today's appointments
  getTodayAppointments(): Observable<any> {
    return this.http.get(
      `${API_BASE_URL}/dashboard/today-appointments`
    );
  }
}