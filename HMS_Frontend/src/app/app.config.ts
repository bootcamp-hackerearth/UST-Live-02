import { ApplicationConfig } from '@angular/core';

import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';

import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    /*
    |--------------------------------------------------------------------------
    | Router
    |--------------------------------------------------------------------------
    */
    provideRouter(routes),

    /*
    |--------------------------------------------------------------------------
    | HTTP
    |--------------------------------------------------------------------------
    */
    provideHttpClient(withInterceptors([authInterceptor])),

    /*
    |--------------------------------------------------------------------------
    | Animations
    |--------------------------------------------------------------------------
    */
    provideAnimations(),

    /*
    |--------------------------------------------------------------------------
    | Toastr
    |--------------------------------------------------------------------------
    */
    provideToastr({
      positionClass: 'toast-top-right',

      timeOut: 3000,

      preventDuplicates: true,

      progressBar: true,

      closeButton: true
    })
  ]
};
