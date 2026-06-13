import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private readonly apiUrl = 'http://localhost:5000/api/consultations';

  constructor(private readonly http: HttpClient) {}

  // Create a new consultation
  createConsultation(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Get all consultations
  getConsultations(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Get consultation by appointment ID
  getConsultationByAppointment(
    appointmentId: string
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/appointment/${appointmentId}`
    );
  }

  // Update consultation details
  updateConsultation(
    id: string,
    data: any
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Download prescription PDF
  downloadPrescriptionPdf(consultationId: string) {
    return this.http.get(
      `${this.apiUrl}/prescription/${consultationId}`,
      {
        responseType: 'blob'
      }
    );
  }

  // Get consultation by ID
  getConsultationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}