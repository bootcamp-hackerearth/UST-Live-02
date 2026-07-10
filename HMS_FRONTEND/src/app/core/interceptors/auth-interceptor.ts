import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/token';
import { AuthService } from '../services/auth';

let refreshRequest$: Observable<any> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  const authService = inject(AuthService);

  const router = inject(Router);

  const accessToken = tokenService.getAccessToken();

  let authReq = req.clone({
    withCredentials: true
  });

  if (accessToken) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isRefreshCall = req.url.includes('/auth/refresh-token');
      const isLoginCall = req.url.includes('/auth/login');
      const isPublicAuthCall =
        isLoginCall ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/forgot-password') ||
        req.url.includes('/auth/reset-password') ||
        req.url.includes('/auth/create-password');

      if (error.status !== 401 || isRefreshCall || isPublicAuthCall) {
        return throwError(() => error);
      }

      refreshRequest$ ??= authService.refreshToken().pipe(
          tap((response: any) => {
            const newAccessToken = response.data.accessToken;

            tokenService.setAccessToken(newAccessToken);
          }),
          finalize(() => {
            refreshRequest$ = null;
          }),
          shareReplay(1)
        );

      return refreshRequest$.pipe(
        switchMap((response: any) => {
          const newAccessToken = response.data.accessToken;

          const retryRequest = req.clone({
            withCredentials: true,
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          });

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          tokenService.removeTokens();

          localStorage.removeItem('role');

          authService.clearCurrentUser();

          router.navigate(['/login']);

          return throwError(() => refreshError);
        })
      );
    })
  );
};
