import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { inject } from '@angular/core';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { Router } from '@angular/router';

import { TokenService } from '../services/token';
import { AuthService } from '../services/auth';
import { MenuNodeService } from '../services/menu-node';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  const authService = inject(AuthService);

  const router = inject(Router);

  const menuNodeService = inject(MenuNodeService);

  const accessToken =
    tokenService.getAccessToken();

  let authReq = req;

  if (accessToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const refreshToken =
        tokenService.getRefreshToken();

      const isRefreshCall =
        req.url.includes('/auth/refresh-token');

      const isCreatePasswordCall =
        req.url.includes('/auth/create-password');

      if (
        error.status !== 401 ||
        !refreshToken ||
        isRefreshCall ||
        isCreatePasswordCall
      ) {
        return throwError(() => error);
      }

      return authService
        .refreshToken(refreshToken)
        .pipe(
          switchMap((response: any) => {
            const newAccessToken =
              response.data.accessToken;

            tokenService.setAccessToken(
              newAccessToken
            );

            const retryRequest =
              req.clone({
                setHeaders: {
                  Authorization:
                    `Bearer ${newAccessToken}`
                }
              });

            return next(retryRequest);
          }),

          catchError((refreshError) => {
            tokenService.removeTokens();
            menuNodeService.clearMenu();

            authService.currentUser.next(null);

            router.navigate(['/login']);

            return throwError(
              () => refreshError
            );
          })
        );
    })
  );
};
