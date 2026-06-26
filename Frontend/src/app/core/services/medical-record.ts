import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private readonly apiUrl = `${API_BASE_URL}/medical-records`;

  constructor(private readonly http: HttpClient) {}

  getRecordPatients(page = 1, limit = 10, search = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get(`${this.apiUrl}/patients`, { params });
  }

  getPrescriptions(page = 1, limit = 10): Observable<any> {
    const params = this.getPaginationParams(page, limit);

    return this.http.get(`${this.apiUrl}/prescriptions`, { params });
  }

  getPatientPrescriptions(
    patientId: string,
    page = 1,
    limit = 10
  ): Observable<any> {
    const params = this.getPaginationParams(page, limit);

    return this.http.get(`${this.apiUrl}/prescriptions/patient/${patientId}`, { params });
  }

  getMyPrescriptions(page = 1, limit = 10): Observable<any> {
    const params = this.getPaginationParams(page, limit);

    return this.http.get(`${this.apiUrl}/prescriptions/my`, { params });
  }

  getPrescriptionById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/prescriptions/${id}`);
  }

  getHealthRecords(page = 1, limit = 10): Observable<any> {
    const params = this.getPaginationParams(page, limit);

    return this.http.get(`${this.apiUrl}/health-records`, { params });
  }

  getPatientHealthRecords(patientId: string, page = 1, limit = 10): Observable<any> {
    const params = this.getPaginationParams(page, limit);

    return this.http.get(`${this.apiUrl}/health-records/patient/${patientId}`, { params });
  }

  createHealthRecord(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/health-records`, data);
  }

  updateHealthRecord(id: string, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/health-records/${id}`, data);
  }

  deleteHealthRecord(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/health-records/${id}`);
  }

  getLabReports(page = 1, limit = 10): Observable<any> {
    const params = this.getPaginationParams(page, limit);

    return this.http.get(`${this.apiUrl}/lab-reports`, { params });
  }

  getPatientLabReports(patientId: string, page = 1, limit = 10): Observable<any> {
    const params = this.getPaginationParams(page, limit);

    return this.http.get(`${this.apiUrl}/lab-reports/patient/${patientId}`, { params });
  }

  createLabReport(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/lab-reports`, data);
  }

  updateLabReport(id: string, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/lab-reports/${id}`, data);
  }

  deleteLabReport(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/lab-reports/${id}`);
  }

  private getPaginationParams(page: number, limit: number): HttpParams {
    return new HttpParams()
      .set('page', page)
      .set('limit', limit);
  }
}
