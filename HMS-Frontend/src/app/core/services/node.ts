import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  readonly nodes = signal<any[]>([]);

  constructor(private readonly http: HttpClient) {
    const storedNodes = localStorage.getItem('nodes');

    if (storedNodes) {
      this.nodes.set(JSON.parse(storedNodes));
    }
  }

  getNodes(params?: any) {
    return this.http.get<any>(`${API_BASE_URL}/nodes`, {
      params
    });
  }

  getManagementNodes() {
    return this.getNodes({
      management: true
    });
  }

  createNode(data: any) {
    return this.http.post<any>(`${API_BASE_URL}/nodes`, data);
  }

  updateNode(id: string, data: any) {
    return this.http.put<any>(`${API_BASE_URL}/nodes/${id}`, data);
  }

  deleteNode(id: string) {
    return this.http.delete<any>(`${API_BASE_URL}/nodes/${id}`);
  }

  loadNodes(): void {
    this.fetchAndStoreNodes().subscribe({
      error: () => this.clearNodes()
    });
  }

  ensureNodesLoaded(): Observable<any[]> {
    const currentNodes = this.nodes();

    if (currentNodes.length) {
      return of(currentNodes);
    }

    return this.fetchAndStoreNodes();
  }

  private fetchAndStoreNodes(): Observable<any[]> {
    return this.getNodes().pipe(
      map((response) => response.data || []),
      tap((nodes) => this.setNodes(nodes)),
      catchError((error) => {
        this.clearNodes();
        return throwError(() => error);
      })
    );
  }

  setNodes(nodes: any[]): void {
    this.nodes.set(nodes);
    localStorage.setItem('nodes', JSON.stringify(nodes));
  }

  clearNodes(): void {
    this.nodes.set([]);
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
        const roleMatches = !permissionRoles.length || permissionRoles.some((role: string) => userRoles.includes(role));

        return methodMatches && pathMatches && roleMatches;
      })
    );
  }

  isSuperAdmin(): boolean {
    return this.getUserRoles().includes('SUPER_ADMIN');
  }

  private getFlatNodes(): any[] {
    return this.nodes().flatMap((node) => [node, ...(node.children || [])]);
  }

  private getUserRoles(): string[] {
    const role = localStorage.getItem('role');

    return role ? [role] : [];
  }
}
