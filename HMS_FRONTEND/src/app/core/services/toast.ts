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
  toast$ = new BehaviorSubject<any>(null);

  show(message: string, type: 'success' | 'error') {
    this.toast$.next({
      message,
      type
    });

    setTimeout(() => {
      this.toast$.next(null);
    }, 3000);
  }
}
