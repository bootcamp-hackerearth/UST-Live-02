import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { AsyncPipe, NgClass } from '@angular/common';

import { Observable } from 'rxjs';

import { ToastService, ToastState } from './core/services/toast';

import { AuthService } from './core/services/auth';
import { NodeService } from './core/services/node';
import { TokenService } from './core/services/token';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, NgClass],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  toastState$: Observable<ToastState | null>;

  constructor(
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly nodeService: NodeService,
    private readonly tokenService: TokenService
  ) {
    this.toastState$ = this.toastService.toast$;
  }

  ngOnInit(): void {
    const token = this.tokenService.getAccessToken();

    if (!token) {
      return;
    }

    if (!this.authService.currentUser.value) {
      this.authService.loadCurrentUser();
    }

    if (!this.nodeService.nodes.value.length) {
      this.nodeService.loadNodes();
    }
  }

  dismissToast(): void {
    this.toastService.toast$.next(null);
  }
}
