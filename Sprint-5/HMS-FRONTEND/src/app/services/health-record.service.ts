import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CreateHealthRecordRequest,
  HealthRecordListResponse,
  HealthRecordSingleResponse,
  UpdateHealthRecordRequest
} from '../models/health-record.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthRecordService {
    
  readonly baseUrl= environment.apiUrl;

  constructor(readonly http: HttpClient) {}

  createHealthRecord(data: CreateHealthRecordRequest): Observable<HealthRecordSingleResponse> {
    return this.http.post<HealthRecordSingleResponse>(`${this.baseUrl}/health-records/create`, data);
  }

 getHealthRecords(
    page: number,
    limit: number,
    search: string
  ): Observable<HealthRecordListResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);

    return this.http.get<HealthRecordListResponse>(
      `${this.baseUrl}/health-records/list`,
      { params }
    );
  }

  getHealthRecordById(id: string): Observable<HealthRecordSingleResponse> {
    return this.http.get<HealthRecordSingleResponse>(`${this.baseUrl}/health-records/${id}`);
  }

  updateHealthRecord(
    id: string,
    data: UpdateHealthRecordRequest
  ): Observable<HealthRecordSingleResponse> {
    return this.http.put<HealthRecordSingleResponse>(`${this.baseUrl}/health-records/update/${id}`, data);
  }

  finalizeHealthRecord(id: string): Observable<HealthRecordSingleResponse> {
    return this.http.put<HealthRecordSingleResponse>(`${this.baseUrl}/health-records/finalize/${id}`, {});
  }

  deleteHealthRecord(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/health-records/delete/${id}`);
  }
}