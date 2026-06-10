import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = 'http://localhost:5000/api/patients';

  constructor(private readonly http: HttpClient) {}

  // Register a new patient
  createPatient(patientData: any): Observable<any> {
    return this.http.post(
      this.apiUrl,
      patientData
    );
  }

  // Get all patients
  getPatients(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Get list of doctors for patient assignment
  getDoctors(): Observable<any> {
    return this.http.get(
      'http://localhost:5000/api/employees/doctors'
    );
  }

  // Get patient details by ID
  getPatientById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Update patient information
  updatePatient(
    id: string,
    patientData: any
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      patientData
    );
  }
}