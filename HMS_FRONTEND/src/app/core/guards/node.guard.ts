import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { NodeService } from '../services/node';

const hasAllowedNode = (nodes: any[], url: string): boolean =>
  nodes.some((node) => node.path === url || node.children?.some((child: { path: string }) => child.path === url));

export const nodeGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const nodeService = inject(NodeService);

  const url = route.data?.['nodePath'] || '/' + route.url.map((segment) => segment.path).join('/');

  const nodes = nodeService.nodes();

  if (hasAllowedNode(nodes, url)) {
    return true;
  }

  return nodeService.ensureNodesLoaded().pipe(
    map((loadedNodes) => (hasAllowedNode(loadedNodes, url) ? true : router.createUrlTree(['/login']))),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
