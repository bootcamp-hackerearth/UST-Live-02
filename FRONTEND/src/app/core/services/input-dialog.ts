import { Injectable, signal } from '@angular/core';

export interface InputDialogState {
  title: string;
  message: string;
  inputLabel: string;
  inputType: 'text' | 'number';
  confirmText: string;
  cancelText: string;
  min?: number;
  resolve: (value: string | null) => void;
}

@Injectable({
  providedIn: 'root'
})
export class InputDialogService {
  readonly dialog = signal<InputDialogState | null>(null);

  ask(options: Partial<Omit<InputDialogState, 'resolve'>>): Promise<string | null> {
    return new Promise((resolve) => {
      this.dialog.set({
        title: options.title || 'Enter value',
        message: options.message || '',
        inputLabel: options.inputLabel || 'Value',
        inputType: options.inputType || 'text',
        confirmText: options.confirmText || 'Save',
        cancelText: options.cancelText || 'Cancel',
        min: options.min,
        resolve
      });
    });
  }

  close(value: string | null): void {
    const current = this.dialog();

    if (!current) {
      return;
    }

    current.resolve(value);
    this.dialog.set(null);
  }
}
