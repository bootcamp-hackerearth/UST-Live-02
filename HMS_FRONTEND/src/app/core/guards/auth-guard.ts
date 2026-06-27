import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../services/token';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);

  const router = inject(Router);

  const isLoggedIn = tokenService.isLoggedIn();

  if (isLoggedIn) {
    return true;
  }

  router.navigate(['/login']);

  return false;
};
