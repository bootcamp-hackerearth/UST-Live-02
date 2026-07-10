import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, tap, throwError } from 'rxjs';
import { OfflineQueueService } from '../services/offline-queue';
import { ToastService } from '../services/toast';

const CACHE_PREFIX = 'httpCache:';
const CACHE_TTL_MS = 10 * 60 * 1000;

const isCacheableGet = (url: string): boolean => !url.includes('/auth/');
const isQueueableMutation = (method: string, body: unknown, url: string): boolean => {
  const normalizedMethod = method.toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod);
  const isAuth = url.includes('/auth/');
  const isFileUpload = typeof FormData !== 'undefined' && body instanceof FormData;

  return isMutation && !isAuth && !isFileUpload;
};

export const offlineCacheInterceptor: HttpInterceptorFn = (req, next) => {
  const queue = inject(OfflineQueueService);
  const toast = inject(ToastService);
  const cacheKey = `${CACHE_PREFIX}${req.method}:${req.urlWithParams}`;

  if (!navigator.onLine) {
    if (req.method === 'GET' && isCacheableGet(req.url)) {
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);

        toast.show('Offline mode', 'error');

        return of(
          new HttpResponse({
            status: 500,
            body: parsed.body,
            url: req.urlWithParams
          })
        );
      }
    }

    if (isQueueableMutation(req.method, req.body, req.url)) {
      queue.enqueue({
        method: req.method,
        url: req.urlWithParams,
        body: req.body
      });

      return of(
        new HttpResponse({
          status: 202,
          body: {
            success: true,
            statusCode: 202,
            message: 'Offline request queued',
            data: null
          },
          url: req.urlWithParams
        })
      );
    }
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && req.method === 'GET' && isCacheableGet(req.url)) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            createdAt: Date.now(),
            body: event.body
          })
        );
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (req.method === 'GET' && isCacheableGet(req.url)) {
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          const parsed = JSON.parse(cached);
          const isFresh = Date.now() - parsed.createdAt <= CACHE_TTL_MS;

          if (isFresh || error.status === 0) {
            toast.show('Network issue', 'error');

            return of(
              new HttpResponse({
                status: 500,
                body: parsed.body,
                url: req.urlWithParams
              })
            );
          }
        }
      }

      return throwError(() => error);
    })
  );
};
