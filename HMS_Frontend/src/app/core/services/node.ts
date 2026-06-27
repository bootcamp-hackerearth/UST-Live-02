import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  nodes = new BehaviorSubject<any[]>([]);

  constructor(private readonly http: HttpClient) {
    const storedNodes = localStorage.getItem('nodes');

    if (storedNodes) {
      this.nodes.next(JSON.parse(storedNodes));
    }
  }

  getNodes() {
    return this.http.get<any>(`${API_BASE_URL}/nodes`);
  }

  loadNodes(): void {
    this.getNodes().subscribe({
      next: (response) => {
        this.nodes.next(response.data);

        localStorage.setItem('nodes', JSON.stringify(response.data));
      },

      error: () => {
        this.nodes.next([]);

        localStorage.removeItem('nodes');
      }
    });
  }

  clearNodes(): void {
    this.nodes.next([]);

    localStorage.removeItem('nodes');
  }

  canAccessPath(path: string): boolean {
    return this.getFlatNodes().some((node) => node.path === path);
  }

  canUseApi(method: string, path: string): boolean {
    const requestMethod = method.toUpperCase();
    const userRoles = this.getUserRoles();

    return this.getFlatNodes().some((node) =>
      node.apiPermissions?.some((permission: any) => {
        const permissionMethod = permission.method?.toUpperCase();
        const methodMatches = permissionMethod === requestMethod || permissionMethod === 'ALL';
        const pathMatches = permission.path === path;
        const permissionRoles = permission.roles || [];
        const roleMatches =
          !permissionRoles.length || permissionRoles.some((role: string) => userRoles.includes(role));

        return methodMatches && pathMatches && roleMatches;
      })
    );
  }

  private getFlatNodes(): any[] {
    return this.nodes.value.flatMap((node) => [node, ...(node.children || [])]);
  }

  private getUserRoles(): string[] {
    const role = localStorage.getItem('role');

    return role ? [role] : [];
  }
}
