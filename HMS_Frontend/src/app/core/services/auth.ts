import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUser.asObservable();
  constructor(private readonly http: HttpClient) {}

  login(data: { loginId: string; password: string }): Observable<any> {
    return this.http.post(`${API_BASE_URL}/auth/login`, data);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/auth/me`);
  }

  loadCurrentUser(): void {
    this.getCurrentUser().subscribe({
      next: (response) => {
        this.currentUser.next(response.data);
      },
      error: () => {
        this.currentUser.next(null);
      }
    });
  }

  createPassword(data: any): Observable<any> {
    return this.http.post(`${API_BASE_URL}/auth/create-password`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${API_BASE_URL}/auth/register`, data);
  }

  // Check if current user has a specific role
  hasRole(role: string): boolean {
    const user = this.currentUser.value;

    if (!user) {
      return false;
    }

    return user.roles?.includes(role);
  }
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken
    });
  }

  logout(refreshToken: string): Observable<any> {
    return this.http.post(`${API_BASE_URL}/auth/logout`, {
      refreshToken
    });
  }

  // Get security question for password recovery
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${API_BASE_URL}/auth/forgot-password`, {
      email: email.trim().toLowerCase()
    });
  }

  // Reset password using security answer
  resetPassword(data: any): Observable<any> {
    return this.http.post(`${API_BASE_URL}/auth/reset-password`, {
      ...data,
      email: data.email?.trim().toLowerCase()
    });
  }
}
