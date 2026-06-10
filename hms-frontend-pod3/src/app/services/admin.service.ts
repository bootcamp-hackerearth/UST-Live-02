import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiUrl } from '../environment/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { DashboardModel } from '../models/ui.model';
import { EmployeeModel, UserEmployeeModel, UserModel } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  http: HttpClient = inject(HttpClient);
  apiUrl: ApiUrl = new ApiUrl();

  //contents of dashboardcard
  getDashboardData(): Observable<DashboardModel> {
    return this.http
      .get<DashboardModel>(`${this.apiUrl.backend_url}/admin/getDashboardData`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  //all the users
  getUsers(): Observable<UserModel[]> {
    return this.http
      .get<UserModel[]>(`${this.apiUrl.backend_url}/admin/getAllUsers`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  //all the employees
  getEmployees(): Observable<EmployeeModel[]> {
    return this.http
      .get<EmployeeModel[]>(`${this.apiUrl.backend_url}/admin/getAllUsers`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  //user employee combo
  getUserEmployee(): Observable<UserEmployeeModel[]> {
    return this.http
      .get<UserEmployeeModel[]>(`${this.apiUrl.backend_url}/admin/getUserEmployee`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  //delete user
  deleteUserProfile(data: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl.backend_url}/admin/deleteUserProfile`, data)
      .pipe(catchError((error) => this.handleError(error)));
  }

  //get user
  getUsersData(): Observable<UserModel[]> {
    return this.http
      .get<UserModel[]>(`${this.apiUrl.backend_url}/admin/getUsers`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // approve user
  approveUser(data: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl.backend_url}/admin/approveUser`, data)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // reject user
  rejectUser(data: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl.backend_url}/admin/rejectUser`, data)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // update user
  updateUserProfile(data: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl.backend_url}/admin/updateUserProfile`, data)
      .pipe(catchError((error) => this.handleError(error)));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
