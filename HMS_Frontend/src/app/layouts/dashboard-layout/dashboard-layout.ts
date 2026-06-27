import { Component, HostListener, ElementRef, ChangeDetectorRef, OnInit, ChangeDetectionStrategy} from '@angular/core';

import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { NodeService } from '../../core/services/node';
import { AuthService } from '../../core/services/auth';
import { TokenService } from '../../core/services/token';
import { ToastService } from '../../core/services/toast';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, AsyncPipe, Sidebar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayout implements OnInit {
  isProfileOpen = false;

  constructor(
    public readonly nodeService: NodeService,
    public authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef
  ) {}

  // Load current user details
  ngOnInit(): void {
    const token = this.tokenService.getAccessToken();

    if (token) {
      this.authService.loadCurrentUser();

      this.nodeService.loadNodes();
    }
  }

  // Close active toast
  dismissToast(): void {
    this.toastService.toast$.next(null);
  }

  // Toggle profile dropdown
  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  // Close dropdown when clicked outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isProfileOpen = false;
    }
  }

  // Logout user
  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();

    this.authService.logout(refreshToken!).subscribe();

    this.tokenService.removeTokens();

    this.authService.currentUser.next(null);

    this.nodeService.clearNodes();

    localStorage.removeItem('role');
    localStorage.removeItem('loginId');

    this.router.navigate(['/login']);

    this.cdr.detectChanges();
  }
}
