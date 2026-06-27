import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = `${API_BASE_URL}/patients`;

  constructor(private readonly http: HttpClient) {}

  // Register a new patient
  createPatient(patientData: any): Observable<any> {
    return this.http.post(this.apiUrl, patientData);
  }

  // Get all patients
  getPatients(params?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  // Get list of doctors for patient assignment
  getDoctors(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/employees/doctors`);
  }

  // Get India states for patient address dropdown
  getIndiaStates(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/locations/india/states`);
  }

  // Get districts for selected India state
  getIndiaDistricts(stateId: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/locations/india/states/${stateId}/districts`);
  }

  // Get pincodes for selected state and district
  getIndiaPincodes(state: string, district: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/locations/india/pincodes`, {
      params: {
        state,
        district
      }
    });
  }

  // Get taluks/subdistricts for selected state and district
  getIndiaTaluks(state: string, district: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/locations/india/taluks`, {
      params: {
        state,
        district
      }
    });
  }

  // Get taluk and post office/area options for selected state and district
  getIndiaPostOffices(state: string, district: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/locations/india/post-offices`, {
      params: {
        state,
        district
      }
    });
  }

  // Get patient details by ID
  getPatientById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Update patient information
  updatePatient(id: string, patientData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, patientData);
  }
  // Delete patient
deletePatient(id: string): Observable<any> {
  return this.http.delete(
    `${this.apiUrl}/${id}`
  );
}
}
 