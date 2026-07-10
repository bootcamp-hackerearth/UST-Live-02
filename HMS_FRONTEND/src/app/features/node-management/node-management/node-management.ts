import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeService } from '../../../core/services/node';
import { ToastService } from '../../../core/services/toast';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

type PermissionDraft = {
  method: string;
  path: string;
  rolesText: string;
};

type NodeDraft = {
  _id?: string;
  name: string;
  path: string;
  icon: string;
  order: number;
  parent: string;
  rolesText: string;
  isActive: boolean;
  apiPermissions: PermissionDraft[];
};

@Component({
  selector: 'app-node-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent, EmptyStateComponent],
  templateUrl: './node-management.html',
  styleUrls: ['./node-management.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeManagement implements OnInit {
  readonly nodes = signal<any[]>([]);
  readonly selectedNodeId = signal('');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'DOCTOR',
    'RECEPTIONIST',
    'CASHIER',
    'NURSE',
    'LAB_TECH',
    'PHARMACIST',
    'PATIENT'
  ];

  readonly methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'ALL'];

  form: NodeDraft = this.getBlankForm();

  constructor(
    private readonly nodeService: NodeService,
    private readonly toast: ToastService,
    private readonly confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadNodes();
  }

  get flatNodes(): any[] {
    return this.nodes().flatMap((node) => [node, ...(node.children || [])]);
  }

  get parentOptions(): any[] {
    return this.nodes().filter((node) => node._id !== this.form._id);
  }

  loadNodes(): void {
    this.isLoading.set(true);

    this.nodeService.getManagementNodes().subscribe({
      next: (response) => {
        this.nodes.set(response.data || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Unable to load nodes');
        this.isLoading.set(false);
      }
    });
  }

  startCreate(): void {
    this.selectedNodeId.set('');
    this.form = this.getBlankForm();
  }

  editNode(node: any): void {
    this.selectedNodeId.set(node._id);
    this.form = {
      _id: node._id,
      name: node.name || '',
      path: node.path || '',
      icon: node.icon || '',
      order: node.order || 0,
      parent: node.parent || '',
      rolesText: (node.roles || []).join(', '),
      isActive: node.isActive !== false,
      apiPermissions: (node.apiPermissions || []).map((permission: any) => ({
        method: permission.method || 'GET',
        path: permission.path || '',
        rolesText: (permission.roles || []).join(', ')
      }))
    };
  }

  addPermission(): void {
    this.form.apiPermissions = [
      ...this.form.apiPermissions,
      {
        method: 'GET',
        path: '',
        rolesText: ''
      }
    ];
  }

  removePermission(index: number): void {
    this.form.apiPermissions = this.form.apiPermissions.filter((_, itemIndex) => itemIndex !== index);
  }

  saveNode(): void {
    if (!this.form.name.trim() || !this.form.path.trim()) {
      this.toast.error('Node name and path are required');
      return;
    }

    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);

    const payload = {
      name: this.form.name.trim(),
      path: this.normalizeRoutePath(this.form.path),
      icon: this.form.icon.trim(),
      order: Number(this.form.order) || 0,
      parent: this.form.parent || null,
      roles: this.parseCsv(this.form.rolesText),
      isActive: this.form.isActive,
      apiPermissions: this.form.apiPermissions
        .filter((permission) => permission.method && permission.path.trim())
        .map((permission) => ({
          method: permission.method,
          path: this.normalizeApiPath(permission.path),
          roles: this.parseCsv(permission.rolesText)
        }))
    };

    const request$ = this.form._id
      ? this.nodeService.updateNode(this.form._id, payload)
      : this.nodeService.createNode(payload);

    request$.subscribe({
      next: () => {
        this.toast.success(this.form._id ? 'Node updated successfully' : 'Node created successfully');
        this.isSaving.set(false);
        this.startCreate();
        this.loadNodes();
        this.nodeService.loadNodes();
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Unable to save node');
        this.isSaving.set(false);
      }
    });
  }

  async deleteNode(node: any): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete node?',
      message: `${node.name} will be removed from navigation and permissions. Child nodes under it will also be removed.`,
      confirmText: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.nodeService.deleteNode(node._id).subscribe({
      next: () => {
        this.toast.success('Node deleted successfully');
        this.startCreate();
        this.loadNodes();
        this.nodeService.loadNodes();
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Unable to delete node');
      }
    });
  }

  private getBlankForm(): NodeDraft {
    return {
      name: '',
      path: '',
      icon: '',
      order: 0,
      parent: '',
      rolesText: 'SUPER_ADMIN',
      isActive: true,
      apiPermissions: [
        {
          method: 'GET',
          path: '',
          rolesText: 'SUPER_ADMIN'
        }
      ]
    };
  }

  private parseCsv(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
  }

  private normalizeRoutePath(path: string): string {
    const cleanPath = path.trim();

    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }

  private normalizeApiPath(path: string): string {
    const cleanPath = this.normalizeRoutePath(path);

    return cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
  }
}
