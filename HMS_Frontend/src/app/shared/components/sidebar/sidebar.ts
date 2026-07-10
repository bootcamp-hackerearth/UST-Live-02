import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NodeService } from '../../../core/services/node';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  constructor(
    public readonly nodeService: NodeService,
    private readonly router: Router
  ) {}

  navigate(path: string): void {
    const currentPath = this.router.url.split('?')[0];
    const shouldResetList = currentPath === path && ['/employees', '/patients', '/appointments'].includes(path);

    this.router.navigate([path], {
      queryParams: shouldResetList ? { navReset: Date.now() } : undefined
    });
  }

  isActive(path: string): boolean {
    return this.router.url.split('?')[0] === path;
  }

  expandedMenus: Record<string, boolean> = {};

  toggleMenu(nodeId: string, event?: MouseEvent): void {
    event?.stopPropagation();
    this.expandedMenus[nodeId] = !this.expandedMenus[nodeId];
  }
}
