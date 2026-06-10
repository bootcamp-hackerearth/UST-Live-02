import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Doctor, CreateDoctorPayload,UpdateDoctorPayload } from '../models/doctor.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  readonly baseUrl = environment.apiUrl;

  constructor(readonly http: HttpClient) {}

  getAllDoctors(): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(`${this.baseUrl}/doctors/list`);
  }

  createDoctor(payload: CreateDoctorPayload): Observable<ApiResponse<Doctor>> {
    return this.http.post<ApiResponse<Doctor>>(`${this.baseUrl}/doctors/create`, payload);
  }

  updateDoctor(
  doctorId: string,
  payload: UpdateDoctorPayload
): Observable<ApiResponse<Doctor>> {
  return this.http.put<ApiResponse<Doctor>>(
    `${this.baseUrl}/doctors/update/${doctorId}`,
    payload
  );
}

}