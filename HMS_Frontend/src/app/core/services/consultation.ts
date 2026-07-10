import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  constructor(private readonly http: HttpClient) {}

  // Create a new consultation
  createConsultation(data: any): Observable<any> {
    return this.http.post(`${API_BASE_URL}/consultations`, data);
  }

  // Get all consultations
  getConsultations(params?: any): Observable<any> {
    return this.http.get(`${API_BASE_URL}/consultations`, { params });
  }

  // Get consultation by appointment ID
  getConsultationByAppointment(appointmentId: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/consultations/appointment/${appointmentId}`);
  }

  // Update consultation details
  updateConsultation(id: string, data: any): Observable<any> {
    return this.http.put(`${API_BASE_URL}/consultations/${id}`, data);
  }

  // Download prescription PDF
  downloadPrescriptionPdf(consultationId: string): Observable<Blob> {
    return this.http.get(`${API_BASE_URL}/consultations/prescription/${consultationId}`, {
      responseType: 'blob'
    });
  }

  // Get consultation details by ID
  getConsultationById(id: string): Observable<any> {
    return this.http.get(`${API_BASE_URL}/consultations/${id}`);
  }
}
