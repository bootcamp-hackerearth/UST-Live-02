import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class ApiPermissionService {
  private readonly apiUrl = `${API_BASE_URL}/api-permissions`;

  constructor(private readonly http: HttpClient) {}

  getMyPermissions(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(
      `${this.apiUrl}/my-permissions`
    );
  }
}
