import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  console.log("Role:", role);

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
