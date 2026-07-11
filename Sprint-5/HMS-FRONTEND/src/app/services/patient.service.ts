import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  Patient,
  CreatePatientPayload,
  CreatePatientResult
} from '../models/patients.model';

import { ApiResponse } from '../models/api-response.model';

export interface PaginationData {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface PaginatedPatientResponse
  extends ApiResponse<Patient[]> {
  pagination: PaginationData;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  readonly baseUrl = environment.apiUrl;

  constructor(readonly http: HttpClient) {}

  getAllPatients(
    page: number,
    limit: number,
    search: string
  ): Observable<PaginatedPatientResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search);

    return this.http.get<PaginatedPatientResponse>(
      `${this.baseUrl}/patients/list`,
      { params }
    );
  }

  createPatient(
    payload: CreatePatientPayload
  ): Observable<ApiResponse<CreatePatientResult>> {
    console.log(payload)
    return this.http.post<ApiResponse<CreatePatientResult>>(
      `${this.baseUrl}/patients/create`,
      payload
    );
  }

  deletePatient(
    patientId: string
  ): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/patients/delete/${patientId}`
    );
  }

  updatePatient(
    patientId: string,
    payload: any
  ) {
    return this.http.put(
      `${this.baseUrl}/patients/update/${patientId}`,
      payload
    );
  }
}