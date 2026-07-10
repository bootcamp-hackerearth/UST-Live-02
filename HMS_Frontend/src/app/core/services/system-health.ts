import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, interval, map, of, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from '../constants/api.constants';

export type SystemHealthState = 'active' | 'inactive';

type HealthResponse = {
  success?: boolean;
  status?: string;
};

@Injectable({
  providedIn: 'root'
})
export class SystemHealthService {
  readonly status = signal<SystemHealthState>(navigator.onLine ? 'active' : 'inactive');

  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private hasStarted = false;

  startMonitoring(): void {
    if (this.hasStarted) {
      return;
    }

    this.hasStarted = true;

    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);

    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.checkHealth()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((status) => {
        this.status.set(status);
      });
  }

  private readonly handleNetworkChange = () => {
    if (!navigator.onLine) {
      this.status.set('inactive');
      return;
    }

    this.checkHealth().subscribe((status) => {
      this.status.set(status);
    });
  };

  private checkHealth() {
    if (!navigator.onLine) {
      return of<SystemHealthState>('inactive');
    }

    return this.http.get<HealthResponse>(`${API_BASE_URL}/health`).pipe(
      map((response) => (response?.success && response?.status === 'UP' ? 'active' : 'inactive')),
      catchError(() => of<SystemHealthState>('inactive'))
    );
  }
}
