import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly LEGACY_REFRESH_TOKEN_KEY = 'refreshToken';

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  removeAccessToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }
  removeTokens(): void {
    this.removeAccessToken();
    localStorage.removeItem(this.LEGACY_REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}
