import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { offlineCacheInterceptor } from './core/interceptors/offline-cache-interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error-interceptor';
import { GlobalErrorHandler } from './core/handlers/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, offlineCacheInterceptor, httpErrorInterceptor])),
    provideToastr(),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};
