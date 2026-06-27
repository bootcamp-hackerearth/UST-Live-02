import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { NodeService } from '../services/node';
export const nodeGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const nodeService = inject(NodeService);

  const url = route.data?.['nodePath'] || '/' + route.url.map((segment) => segment.path).join('/');

  const nodes = nodeService.nodes.value;

  const allowed = nodes.some(
    (node) => node.path === url || node.children?.some((child: { path: string }) => child.path === url)
  );

  if (allowed) {
    return true;
  }

  router.navigate(['/login']);

  return false;
};
