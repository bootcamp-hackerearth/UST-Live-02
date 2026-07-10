import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  tone: 'danger' | 'primary';
  resolve: (confirmed: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  readonly dialog = signal<ConfirmDialogState | null>(null);

  confirm(options: Partial<Omit<ConfirmDialogState, 'resolve'>>): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialog.set({
        title: options.title || 'Confirm action',
        message: options.message || 'Are you sure you want to continue?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        tone: options.tone || 'primary',
        resolve
      });
    });
  }

  close(confirmed: boolean): void {
    const current = this.dialog();

    if (!current) {
      return;
    }

    current.resolve(confirmed);
    this.dialog.set(null);
  }
}
