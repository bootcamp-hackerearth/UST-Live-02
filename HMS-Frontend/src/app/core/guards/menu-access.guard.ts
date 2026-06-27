import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MenuNodeService } from '../services/menu-node';

export const menuAccessGuard = (menuPath: string): CanActivateFn => {
  return (): ReturnType<CanActivateFn> => {
    const menuNodeService = inject(MenuNodeService);
    const router = inject(Router);
    const cachedMenuNodes = menuNodeService.getCurrentMenu();

    if (cachedMenuNodes.length > 0) {
      return menuNodeService.canAccessPath(menuPath)
        ? true
        : router.createUrlTree(['/login']);
    }

    return menuNodeService.loadMyMenu().pipe(
      map((response): boolean | UrlTree => {
        if (menuNodeService.getMenuPaths(response.data || []).includes(menuPath)) {
          return true;
        }

        return router.createUrlTree(['/login']);
      }),
      catchError(() => of(router.createUrlTree(['/login'])))
    );
  };
};
