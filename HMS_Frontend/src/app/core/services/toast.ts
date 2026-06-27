import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toast$ = new BehaviorSubject<ToastState | null>(null);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  show(message: string, type: 'success' | 'error'): void {
    this.toast$.next({
      message,
      type
    });

    setTimeout(() => {
      this.toast$.next(null);
    }, 3000);
  }
}
