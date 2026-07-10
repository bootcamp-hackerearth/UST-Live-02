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
    this.router.navigate([path]);
  }
  expandedMenus: Record<string, boolean> = {};

  toggleMenu(nodeId: string): void {
    this.expandedMenus[nodeId] = !this.expandedMenus[nodeId];
  }
}
