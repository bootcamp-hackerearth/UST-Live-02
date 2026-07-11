import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResponse } from '../models/pagination.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApprovalRequest } from '../models/approval.model';

@Injectable({
  providedIn: 'root'
})
export class ApprovalsService {

  readonly baseUrl = environment.apiUrl;

  constructor(readonly http: HttpClient) { }

  getPendingRequests(
    page: number,
    limit: number,
    search: string
  ): Observable<PaginatedResponse<ApprovalRequest>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);

    return this.http.get<PaginatedResponse<ApprovalRequest>>(
      `${this.baseUrl}/join-us/pending`,
      { params }
    );
  }
  approveRequest(requestId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/join-us/approve/${requestId}`, {});
  }

  rejectRequest(requestId: string, rejectionReason: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/join-us/reject/${requestId}`, { rejectionReason });
  }

}