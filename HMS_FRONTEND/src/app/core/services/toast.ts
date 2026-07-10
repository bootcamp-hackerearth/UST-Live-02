import { Injectable, signal } from '@angular/core';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toast = signal<ToastState | null>(null);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  show(message: string, type: 'success' | 'error'): void {
    this.toast.set({
      message,
      type
    });

    setTimeout(() => {
      this.dismiss();
    }, 3000);
  }

  dismiss(): void {
    this.toast.set(null);
  }
}
