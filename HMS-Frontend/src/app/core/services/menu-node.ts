import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

export interface MenuNode {
  _id: string;
  label: string;
  path: string;
  parentId?: string | null;
  icon: string;
  allowedRoles: string[];
  order: number;
  children?: MenuNode[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuNodeService {
  private readonly apiUrl = `${API_BASE_URL}/menu-nodes`;
  private readonly STORAGE_KEY = 'menuNodes';

  readonly menuNodes$ = new BehaviorSubject<MenuNode[]>(
    this.getStoredMenuNodes()
  );

  constructor(private readonly http: HttpClient) {}

  private getMyMenu(): Observable<{ success: boolean; data: MenuNode[] }> {
    return this.http.get<{ success: boolean; data: MenuNode[] }>(
      `${this.apiUrl}/my-menu`
    );
  }

  loadMyMenu(): Observable<{ success: boolean; data: MenuNode[] }> {
    return this.getMyMenu().pipe(
      tap((response) => {
        this.setMenuNodes(response.data || []);
      })
    );
  }

  getCurrentMenu(): MenuNode[] {
    return this.menuNodes$.value;
  }

  getMenuPaths(menuNodes = this.getCurrentMenu()): string[] {
    return menuNodes.flatMap((menuNode) => [
      menuNode.path,
      ...this.getMenuPaths(menuNode.children || [])
    ]);
  }

  canAccessPath(path: string): boolean {
    return this.getMenuPaths().includes(path);
  }

  getDefaultRedirectPath(menuNodes = this.getCurrentMenu()): string {
    const menuPaths = this.getMenuPaths(menuNodes);

    return (
      menuPaths.find((path) => path.startsWith('/dashboard/')) ||
      menuPaths.find((path) => !path.startsWith('group:')) ||
      '/login'
    );
  }

  clearMenu(): void {
    this.menuNodes$.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private setMenuNodes(menuNodes: MenuNode[]): void {
    this.menuNodes$.next(menuNodes);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(menuNodes));
  }

  private getStoredMenuNodes(): MenuNode[] {
    const storedMenuNodes = localStorage.getItem(this.STORAGE_KEY);

    if (!storedMenuNodes) {
      return [];
    }

    try {
      return JSON.parse(storedMenuNodes);
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return [];
    }
  }
}
