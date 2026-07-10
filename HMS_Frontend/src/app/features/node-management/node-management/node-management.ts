import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

type PermissionAction = {
  value: string;
  label: string;
  description: string;
};

type SystemAreaOption = {
  path: string;
  label: string;
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
  nodes: any[] = [];
  selectedNodeId = '';
  isLoading = false;
  isSaving = false;

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

  readonly permissionActions: PermissionAction[] = [
    {
      value: 'GET',
      label: 'View information',
      description: 'Allows users to open screens, lists, profiles, reports, or other read-only information.'
    },
    {
      value: 'POST',
      label: 'Create new record',
      description: 'Allows users to add a new patient, appointment, employee, report, or similar record.'
    },
    {
      value: 'PUT',
      label: 'Update full record',
      description: 'Allows users to save major edits to an existing record.'
    },
    {
      value: 'PATCH',
      label: 'Approve, cancel, or status change',
      description: 'Allows users to perform a focused action such as approve, reject, activate, deactivate, or cancel.'
    },
    {
      value: 'DELETE',
      label: 'Remove record',
      description: 'Allows users to delete or remove an existing record.'
    },
    {
      value: 'ALL',
      label: 'Allow every action',
      description: 'Gives this node every action for the selected system endpoint. Use only for trusted admin areas.'
    }
  ];

  form: NodeDraft = this.getBlankForm();

  constructor(
    private readonly nodeService: NodeService,
    private readonly route: ActivatedRoute,
    private readonly toast: ToastService,
    private readonly confirmDialog: ConfirmDialogService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.nodes = this.route.snapshot.data['nodes']?.data || [];
  }

  get flatNodes(): any[] {
    return this.nodes.flatMap((node) => [node, ...(node.children || [])]);
  }

  get parentOptions(): any[] {
    return this.nodes.filter((node) => node._id !== this.form._id);
  }

  get systemAreaOptions(): SystemAreaOption[] {
    const options = new Map<string, string>();

    this.form.apiPermissions.forEach((permission) => {
      if (!permission.path || options.has(permission.path)) {
        return;
      }

      options.set(permission.path, this.humanizeSystemArea(permission.path));
    });

    if (this.form.path) {
      const screenApiPath = this.normalizeApiPath(this.form.path);

      if (!options.has(screenApiPath)) {
        options.set(screenApiPath, `${this.form.name || 'Current screen'} area`);
      }
    }

    return Array.from(options.entries())
      .map(([path, label]) => ({ path, label }))
      .sort((first, second) => first.label.localeCompare(second.label));
  }

  loadNodes(): void {
    this.isLoading = true;

    this.nodeService.getManagementNodes().subscribe({
      next: (response) => {
        this.nodes = response.data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Unable to load nodes');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  startCreate(): void {
    this.selectedNodeId = '';
    this.form = this.getBlankForm();
  }

  editNode(node: any): void {
    this.selectedNodeId = node._id;
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

  getActionLabel(method: string): string {
    return this.permissionActions.find((action) => action.value === method)?.label || 'Select action';
  }

  getActionDescription(method: string): string {
    return (
      this.permissionActions.find((action) => action.value === method)?.description ||
      'Choose what users are allowed to do in this area.'
    );
  }

  saveNode(): void {
    if (!this.form.name.trim() || !this.form.path.trim()) {
      this.toast.error('Node name and path are required');
      return;
    }

    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

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
        this.isSaving = false;
        this.startCreate();
        this.loadNodes();
        this.nodeService.loadNodes();
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Unable to save node');
        this.isSaving = false;
        this.cdr.markForCheck();
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

  private humanizeSystemArea(path: string): string {
    let routePath = path;

    if (path.startsWith('/api/')) {
      routePath = path.slice(5);
    } else if (path.startsWith('/api')) {
      routePath = path.slice(4);
    }

    const cleanPath = routePath
      .replaceAll(/:\w+/g, 'selected record')
      .replaceAll(/[-/]+/g, ' ')
      .trim();

    if (!cleanPath) {
      return 'General system area';
    }

    return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
  }
}
