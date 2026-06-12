import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  
  readonly apiUrl = 'http://localhost:5000/api/emp';
  readonly patientUrl = 'http://localhost:5000/api/patient';
  readonly appointmentUrl = 'http://localhost:5000/api/appointment';

  readonly userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(readonly http: HttpClient) {}


  /* LOGIN */
  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  /* FORM SIGNUP */
  formSignup(data: any) {
    return this.http.post(`${this.apiUrl}/formSignUp`, data);
  }

  /* ADMIN SIGNUP */
  adminSignup(data: any) {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  /* CURRENT USER */
  getCurrentUser() {
    return this.http.get(`${this.apiUrl}/currentUser`);
  }

  /* DASHBOARD */
  getDashboardStats() {
    return this.http.get(`${this.apiUrl}/dashboard-stats`);
  }

  /* LOAD USER */
  loadUser() {
     if (globalThis.window) {
      const token = localStorage.getItem('token');

      if (token) {
        this.getCurrentUser().subscribe({
          next: (res: any) => {
            console.log(res);
            this.userSubject.next(res);
          },
          error: () => {
            this.userSubject.next(null);
          },
        });
      } else {
        this.userSubject.next(null);
      }
    }
  }

  /* USER OBSERVABLE */
  getUser() {
    return this.user$;
  }

  /* EMPLOYEES */
  getEmployees() {
    return this.http.get(`${this.apiUrl}/employees`);
  }

  deleteEmployee(employeeId: string) {
    return this.http.delete(`${this.apiUrl}/deleteEmployee/${employeeId}`);
  }

  /* RESET PASSWORD */
  resetPassword(data: any) {
    return this.http.put(`${this.apiUrl}/reset-password`, data);
  }

  /* PATIENT */
  createPatient(data: any) {
    return this.http.post(`${this.patientUrl}/createPatient`, data);
  }

  getAllPatients() {
    return this.http.get(`${this.patientUrl}/getAllPatients`);
  }

  getSinglePatient(patientId: string) {
    return this.http.get(`${this.patientUrl}/getSinglePatient/${patientId}`);
  }

  updatePatient(patientId: string, data: any) {
    return this.http.put(`${this.patientUrl}/updatePatient/${patientId}`, data);
  }

  deletePatient(patientId: string) {
    return this.http.delete(`${this.patientUrl}/deletePatient/${patientId}`);
  }

  getPatientUI() {
    return this.http.get(`${this.patientUrl}/getPatientUI`);
  }

  /* APPOINTMENT */
  createAppointment(data: any) {
    return this.http.post(`${this.appointmentUrl}/createAppointment`, data);
  }

  getAllAppointments() {
    return this.http.get(`${this.appointmentUrl}/getAllAppointments`);
  }

  getDoctors() {
    return this.http.get(`${this.appointmentUrl}/getDoctors`);
  }

  deleteAppointment(appointmentId: string) {
    return this.http.delete(
      `${this.appointmentUrl}/deleteAppointment/${appointmentId}` );
  }
  approveAppointment(appointmentId: string) {
  return this.http.put(
    `${this.appointmentUrl}/approveAppointment/${appointmentId}`,
    {}
  );
}

rejectAppointment(appointmentId: string) {
  return this.http.put(
    `${this.appointmentUrl}/rejectAppointment/${appointmentId}`,
    {}
  );
}

  getAppointmentUI() {
    return this.http.get(`${this.appointmentUrl}/getAppointmentUI`);
  }

  getPendingApprovals() {
    return this.http.get(`${this.apiUrl}/pendingApprovals`);
  }

  approveEmployee(employeeId: string) {
    return this.http.put(`${this.apiUrl}/approveEmployee/${employeeId}`, {});
  }

  getApprovalStats() {
    return this.http.get(`${this.apiUrl}/approvalStats`);
  }
}
