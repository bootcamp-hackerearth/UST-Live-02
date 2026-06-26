import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private readonly http: HttpClient) {}

  // Create a new employee
  createEmployee(data: any): Observable<any> {
    return this.http.post(`${API_BASE_URL}/employees`, data);
  }

  // Get all employees
  getEmployees(page = 1, limit = 10, filters: any = {}): Observable<any> {
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

    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder || 'desc';
    }

    return this.http.get(`${API_BASE_URL}/employees`, { params });
  }

  // Get employee details by ID
  getEmployeeById(id: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/employees/${id}`);
  }

  // Update employee details
  updateEmployee(id: string, data: any): Observable<any> {
    return this.http.put(
      `${API_BASE_URL}/employees/${id}`,
      data
    );
  }

  // Deactivate employee account
  deactivateEmployee(id: string): Observable<any> {
    return this.http.patch(
      `${API_BASE_URL}/employees/${id}/deactivate`,
      {}
    );
  }

  // Activate employee account
  activateEmployee(id: string): Observable<any> {
    return this.http.patch(
      `${API_BASE_URL}/employees/${id}/activate`,
      {}
    );
  }

  // Soft delete employee
  deleteEmployee(id: string): Observable<any> {
    return this.http.delete(`${API_BASE_URL}/employees/${id}`);
  }

  // Get employees waiting for approval
  getPendingEmployees(page = 1, limit = 10, filters: any = {}): Observable<any> {
    const params: any = {
      page,
      limit
    };

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder || 'desc';
    }

    return this.http.get(`${API_BASE_URL}/employees/pending-employees`, { params });
  }

  // Approve employee registration
  approveEmployee(
    employeeId: string,
    data: any
  ): Observable<any> {
    return this.http.patch(
      `${API_BASE_URL}/employees/${employeeId}/approve-employee`,
      data
    );
  }

  // Reject employee registration
  rejectEmployee(employeeId: string): Observable<any> {
    return this.http.patch(
      `${API_BASE_URL}/employees/${employeeId}/reject-employee`,
      {}
    );
  }

  // Get all available doctors
  getDoctors(page = 1, limit = 100): Observable<any> {
  return this.http.get(`${API_BASE_URL}/employees/doctors`, {
    params: {
      page,
      limit
    }
  });
}

  // Get logged-in doctor's availability settings
  getDoctorAvailability(): Observable<any> {
    return this.http.get(
      `${API_BASE_URL}/employees/doctor/availability`
    );
  }

  // Update logged-in doctor's availability settings
  updateDoctorAvailability(data: any): Observable<any> {
    return this.http.patch(
      `${API_BASE_URL}/employees/doctor/availability`,
      data
    );
  }
}
