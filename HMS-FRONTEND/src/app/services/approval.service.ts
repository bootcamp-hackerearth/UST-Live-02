import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApprovalRequest } from '../models/approval.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApprovalsService {

  readonly baseUrl = environment.apiUrl;

  constructor(readonly http: HttpClient) {}

  getPendingRequests(): Observable<ApiResponse<ApprovalRequest[]>> {
    return this.http.get<ApiResponse<ApprovalRequest[]>>(`${this.baseUrl}/join-us/pending`);
  }

  approveRequest(requestId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/join-us/approve/${requestId}`, {});
  }

  rejectRequest(requestId: string, rejectionReason: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/join-us/reject/${requestId}`, { rejectionReason });
  }

}