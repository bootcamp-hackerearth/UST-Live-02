import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiMessage } from '../models/api-response.model';
import {
  CreateNodePayload,
  MyNodesResponse,
  NodeMutationResponse,
  NodesResponse,
  SidebarNode,
  UpdateNodePayload,
} from '../models/node.model';

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/nodes`;

  // Sidebar nodes cached after the first load so navigation doesn't refetch
  private cachedNodes: SidebarNode[] | null = null;

  // Raw fetch of the logged-in user's sidebar nodes (already filtered by designation)
  getMyNodes(): Observable<MyNodesResponse> {
    return this.http.get<MyNodesResponse>(`${this.apiUrl}/my-nodes`);
  }

  // OWNER-only: paginated list of all sidebar nodes with optional search
  getNodes(page = 1, limit = 10, search?: string): Observable<NodesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<NodesResponse>(this.apiUrl, { params });
  }

  // OWNER-only: create a sidebar node
  createNode(payload: CreateNodePayload): Observable<NodeMutationResponse> {
    return this.http
      .post<NodeMutationResponse>(`${this.apiUrl}/create-node`, payload)
      .pipe(tap(() => this.clearCache()));
  }

  // OWNER-only: update a sidebar node
  updateNode(
    nodeId: string,
    payload: UpdateNodePayload,
  ): Observable<NodeMutationResponse> {
    return this.http
      .put<NodeMutationResponse>(
        `${this.apiUrl}/update-node/${nodeId}`,
        payload,
      )
      .pipe(tap(() => this.clearCache()));
  }

  // OWNER-only: delete a sidebar node
  deleteNode(nodeId: string): Observable<ApiMessage> {
    return this.http
      .delete<ApiMessage>(`${this.apiUrl}/delete-node/${nodeId}`)
      .pipe(tap(() => this.clearCache()));
  }

  // Returns cached nodes if loaded, otherwise fetches once and caches them
  loadMyNodes(): Observable<SidebarNode[]> {
    if (this.cachedNodes) {
      return of(this.cachedNodes);
    }
    return this.getMyNodes().pipe(
      map((res) => res.data?.nodes ?? []),
      tap((nodes) => (this.cachedNodes = nodes)),
    );
  }

  // Clears the cached nodes (call on logout)
  clearCache(): void {
    this.cachedNodes = null;
  }
}
