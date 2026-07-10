import { Component, HostListener, ElementRef, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NodeService } from '../../core/services/node';
import { AuthService } from '../../core/services/auth';
import { TokenService } from '../../core/services/token';
import { ToastService } from '../../core/services/toast';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, Sidebar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayout implements OnInit {
  readonly isProfileOpen = signal(false);

  constructor(
    public readonly nodeService: NodeService,
    public authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly toastService: ToastService,
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
    this.toastService.dismiss();
  }

  // Toggle profile dropdown
  toggleProfile(): void {
    this.isProfileOpen.update(v => !v);
  }

  // Close dropdown when clicked outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isProfileOpen.set(false);
    }
  }

  // Logout user
  logout(): void {
    this.authService.logout().subscribe();

    this.tokenService.removeTokens();

    this.authService.clearCurrentUser();

    this.nodeService.clearNodes();

    localStorage.removeItem('role');
    localStorage.removeItem('loginId');

    this.router.navigate(['/login']);
  }
}
