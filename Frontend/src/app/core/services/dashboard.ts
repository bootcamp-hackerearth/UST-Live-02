import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${API_BASE_URL}/dashboard`;

  constructor(private readonly http: HttpClient) {}

  // Get admin dashboard statistics
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-stats`);
  }

  // Get recently added employees
  getRecentEmployees(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recent-employees`);
  }

  // Get doctor dashboard statistics
  getDoctorStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctor-stats`);
  }

  // Get receptionist dashboard statistics
  getReceptionistStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/receptionist-stats`);
  }

  // Get today's appointments
  getTodayAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/today-appointments`);
  }
}
