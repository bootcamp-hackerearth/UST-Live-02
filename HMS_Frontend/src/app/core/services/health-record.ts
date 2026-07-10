import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class HealthRecordService {
  constructor(private readonly http: HttpClient) {}

  // Get health records
  getHealthRecords(params?: any): Observable<any> {
    return this.http.get(`${API_BASE_URL}/health-records`, {
      params
    });
  }

  // Get health record details
  getHealthRecordDetails(patientId: string, params?: any): Observable<any> {
    return this.http.get(`${API_BASE_URL}/health-records/${patientId}`, {
      params
    });
  }

  // Add lab report
  addLabReport(patientId: string, data: FormData): Observable<any> {
    return this.http.post(`${API_BASE_URL}/health-records/${patientId}/lab-reports`, data);
  }

  // Update lab report
  updateLabReport(patientId: string, reportId: string, data: FormData): Observable<any> {
    return this.http.put(`${API_BASE_URL}/health-records/${patientId}/lab-reports/${reportId}`, data);
  }

  // Delete lab report
  deleteLabReport(patientId: string, reportId: string): Observable<any> {
    return this.http.delete(`${API_BASE_URL}/health-records/${patientId}/lab-reports/${reportId}`);
  }

  // Add medical document
  addMedicalDocument(patientId: string, data: FormData): Observable<any> {
    return this.http.post(`${API_BASE_URL}/health-records/${patientId}/medical-documents`, data);
  }

  // Update medical document
  updateMedicalDocument(patientId: string, documentId: string, data: FormData): Observable<any> {
    return this.http.put(`${API_BASE_URL}/health-records/${patientId}/medical-documents/${documentId}`, data);
  }

  // Delete medical document
  deleteMedicalDocument(patientId: string, documentId: string): Observable<any> {
    return this.http.delete(`${API_BASE_URL}/health-records/${patientId}/medical-documents/${documentId}`);
  }
}
