import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  readonly baseUrl=environment.apiUrl;

  constructor(readonly http: HttpClient) { }

  getProfile() {
    return this.http.get<any>(`${this.baseUrl}/users/profile`);
  }
 
  checkJoinUsEmail(data: any) {
    return this.http.post(`${this.baseUrl}/join-us/check-email`, data);
  }

  joinUs(data: any) {
    return this.http.post(`${this.baseUrl}/join-us/create`, data);
  }

  login(loginData: any) {
    return this.http.post<any>(
      `${this.baseUrl}/auth/login`,
      loginData
    );
  }
}
