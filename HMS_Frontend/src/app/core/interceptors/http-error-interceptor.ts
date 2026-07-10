import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger';

const shouldLogHttpError = (error: HttpErrorResponse): boolean => {
  if (error.status === 401) {
    return false;
  }

  return error.status === 0 || error.status >= 400;
};

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (shouldLogHttpError(error)) {
        logger.error('HTTP request failed', error, {
          method: req.method,
          url: req.urlWithParams,
          status: error.status,
          message: error.message
        });
      }

      return throwError(() => error);
    })
  );
};
