import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, NgClass } from '@angular/common';

import { ToastService, ToastState } from './core/services/toast';

import { Observable } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, NgClass],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  toastState$: Observable<ToastState | null>;

  constructor(private readonly toastService: ToastService) {
    this.toastState$ = this.toastService.toast$;
  }

  dismissToast(): void {
    this.toastService.toast$.next(null);
  }
}
