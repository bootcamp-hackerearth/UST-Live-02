import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee, CreateEmployeePayload, UpdateEmployeePayload, PaginatedEmployeeResponse } from '../models/employee.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  readonly baseUrl = environment.apiUrl;

  constructor(readonly http: HttpClient) { }

  getAllEmployees(
    page: number,
    limit: number,
    search: string
  ): Observable<PaginatedEmployeeResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);

    return this.http.get<PaginatedEmployeeResponse>(
      `${this.baseUrl}/users/list`,
      { params }
    );
  }

  createEmployee(payload: CreateEmployeePayload): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(`${this.baseUrl}/users/create`, payload);
  }

  updateEmployee(
    employeeId: string,
    payload: UpdateEmployeePayload
  ): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(
      `${this.baseUrl}/users/update/${employeeId}`,
      payload
    );
  }

  deleteEmployee(
    employeeId: string
  ): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/users/delete/${employeeId}`
    );
  }
}