import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  readonly baseUrl = environment.apiUrl;

  constructor(readonly http: HttpClient) { }

  getProfile() {
    return this.http.get<any>(
      `${this.baseUrl}/users/profile`,
      {
        withCredentials: true
      }
    );
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
      loginData,
      {
        withCredentials: true
      }
    );
  }

  refreshToken() {
    return this.http.post(
      `${this.baseUrl}/auth/refresh-token`,
      {},
      {
        withCredentials: true
      }
    );
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.http.post<any>(
      `${this.baseUrl}/auth/change-password`,
      {
        oldPassword,
        newPassword,
      },
      {
        withCredentials: true
      }
    );
  }

  logout() {
    return this.http.post(
      `${this.baseUrl}/auth/logout`,
      {},
      {
        withCredentials: true
      }
    );
  }
}
