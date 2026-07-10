import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { ToastService } from './core/services/toast';
import { AuthService } from './core/services/auth';
import { NodeService } from './core/services/node';
import { TokenService } from './core/services/token';
import { NetworkStatusService } from './core/services/network-status';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { InputDialogComponent } from './shared/components/input-dialog/input-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass, ConfirmDialogComponent, InputDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly nodeService = inject(NodeService);
  private readonly tokenService = inject(TokenService);
  private readonly networkStatus = inject(NetworkStatusService);

  readonly toast = this.toastService.toast;
  readonly online = this.networkStatus.online;

  ngOnInit(): void {
    const token = this.tokenService.getAccessToken();

    if (!token) {
      return;
    }

    if (!this.authService.currentUser()) {
      this.authService.loadCurrentUser();
    }

    if (!this.nodeService.nodes().length) {
      this.nodeService.loadNodes();
    }
  }

  dismissToast(): void {
    this.toastService.dismiss();
  }
}
