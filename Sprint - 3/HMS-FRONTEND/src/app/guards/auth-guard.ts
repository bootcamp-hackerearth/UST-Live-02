import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  console.log("Auth guard activated");
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

   console.log("Token:", token);
  console.log("Role:", role);

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
