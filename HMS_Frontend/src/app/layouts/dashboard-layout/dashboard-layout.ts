import { Component, HostListener, ElementRef, ChangeDetectorRef, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NodeService } from '../../core/services/node';
import { AuthService } from '../../core/services/auth';
import { TokenService } from '../../core/services/token';
import { ToastService } from '../../core/services/toast';
import { SystemHealthService } from '../../core/services/system-health';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, Sidebar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayout implements OnInit {
  isProfileOpen = false;
  isSidebarOpen = false;
  isSidebarCollapsed = false;

  constructor(
    public readonly nodeService: NodeService,
    public authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    public readonly systemHealth: SystemHealthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef,
    private readonly destroyRef: DestroyRef
  ) {}

  // Load current user details
  ngOnInit(): void {
    this.systemHealth.startMonitoring();

    const token = this.tokenService.getAccessToken();

    if (token) {
      this.authService.loadCurrentUser();

      this.nodeService.loadNodes();
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.closeSidebar();
      });
  }

  // Close active toast
  dismissToast(): void {
    this.toastService.dismiss();
  }

  // Toggle profile dropdown
  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  toggleNavigation(): void {
    if (this.isMobileViewport()) {
      this.toggleSidebar();
      return;
    }

    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.cdr.markForCheck();
  }

  private toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.cdr.markForCheck();
  }

  closeSidebar(): void {
    if (!this.isSidebarOpen) {
      return;
    }

    this.isSidebarOpen = false;
    this.cdr.markForCheck();
  }

  private isMobileViewport(): boolean {
    return window.innerWidth <= 768;
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
    this.authService.logout().subscribe();

    this.tokenService.removeTokens();

    this.authService.clearCurrentUser();

    this.nodeService.clearNodes();

    localStorage.removeItem('role');
    localStorage.removeItem('loginId');

    this.router.navigate(['/login']);

    this.cdr.detectChanges();
  }
}
