import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private readonly apiUrl = `${API_BASE_URL}/consultations`;

  constructor(private readonly http: HttpClient) {}

  // Create a new consultation
  createConsultation(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Get all consultations
  getConsultations(page = 1, limit = 10, filters: any = {}): Observable<any> {
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

    if (filters.fromDate) {
      params.fromDate = filters.fromDate;
    }

    if (filters.toDate) {
      params.toDate = filters.toDate;
    }

    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder || 'desc';
    }

    return this.http.get(this.apiUrl, { params });
  }

  // Get consultation by appointment ID
  getConsultationByAppointment(
    appointmentId: string
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/appointment/${appointmentId}`
    );
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
