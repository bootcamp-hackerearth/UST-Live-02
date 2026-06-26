import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../core/services/auth';
import { MenuNode, MenuNodeService } from '../../../core/services/menu-node';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-sidebar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  menuNodes: MenuNode[] = [];
  expandedMenuIds = new Set<string>();
  private menuSubscription?: Subscription;
  private readonly iconPaths: Record<string, string> = {
    dashboard: 'M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    patients: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M16 11h6',
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
    'calendar-plus': 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM12 14v4M10 16h4',
    'calendar-days': 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    'user-plus': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M16 11h6',
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z',
    queue: 'M4 6h16M4 12h10M4 18h7M17 15l3 3-3 3',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2',
    'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h8M8 9h2',
    'user-circle': 'M18 20a6 6 0 0 0-12 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20'
  };

  constructor(
    public authService: AuthService,
    private readonly menuNodeService: MenuNodeService
  ) {}

  ngOnInit(): void {
    this.menuSubscription = this.menuNodeService.menuNodes$.subscribe(
      (menuNodes) => {
        this.menuNodes = menuNodes;
        this.openActiveMenuGroup();
      }
    );

    this.loadMenuNodes();
  }

  ngOnDestroy(): void {
    this.menuSubscription?.unsubscribe();
  }

  loadMenuNodes(): void {
    if (this.menuNodeService.getCurrentMenu().length > 0) {
      return;
    }

    this.menuNodeService.loadMyMenu().subscribe({
      error: () => {
        this.menuNodes = [];
      }
    });
  }

  hasChildren(menu: MenuNode): boolean {
    return !!menu.children?.length;
  }

  getIconPath(icon?: string): string {
    return this.iconPaths[icon || ''] || this.iconPaths['dashboard'];
  }

  isExpanded(menuId: string): boolean {
    return this.expandedMenuIds.has(menuId);
  }

  toggleMenu(menuId: string): void {
    if (this.expandedMenuIds.has(menuId)) {
      this.expandedMenuIds.delete(menuId);
      return;
    }

    this.expandedMenuIds.add(menuId);
  }

  private openActiveMenuGroup(): void {
    const currentPath = window.location.pathname;

    this.menuNodes.forEach((menu) => {
      const hasActiveChild = menu.children?.some(
        (child) => child.path === currentPath
      );

      if (hasActiveChild) {
        this.expandedMenuIds.add(menu._id);
      }
    });
  }
}
