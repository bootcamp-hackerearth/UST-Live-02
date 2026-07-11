import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { Auth } from '../services/auth';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const authService = inject(Auth);
  const router = inject(Router);

  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(

    catchError((error: HttpErrorResponse) => {

      if (
        error.status === 401 &&
        error.error?.code === 'ACCESS_TOKEN_EXPIRED' &&
        !req.url.includes('/auth/refresh-token')
      ) {

        return authService.refreshToken().pipe(

          switchMap(() => {

            const retryReq = req.clone({
              withCredentials: true
            });

            return next(retryReq);
          }),

          catchError(() => {

            localStorage.removeItem('user');
            localStorage.removeItem('role');
            localStorage.removeItem('basePath');

            router.navigate(['/login']);

            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};