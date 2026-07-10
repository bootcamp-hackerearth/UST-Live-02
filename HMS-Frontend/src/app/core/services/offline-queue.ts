import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { ToastService } from './toast';

export interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  body: unknown;
  createdAt: string;
}

const QUEUE_KEY = 'offlineRequestQueue';

@Injectable({
  providedIn: 'root'
})
export class OfflineQueueService {
  private isFlushing = false;

  constructor(
    private readonly http: HttpClient,
    private readonly toast: ToastService,
    private readonly zone: NgZone
  ) {
    globalThis.addEventListener('online', () => {
      this.zone.run(() => this.flushQueue());
    });
  }

  enqueue(request: Omit<QueuedRequest, 'id' | 'createdAt'>): void {
    const queue = this.getQueue();

    queue.push({
      ...request,
      id: `${Date.now()}-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    this.toast.show('You are offline. This change was queued and will retry automatically.', 'success');
  }

  getQueue(): QueuedRequest[] {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch {
      localStorage.removeItem(QUEUE_KEY);
      return [];
    }
  }

  flushQueue(): void {
    if (this.isFlushing || !navigator.onLine) {
      return;
    }

    const queue = this.getQueue();

    if (!queue.length) {
      return;
    }

    this.isFlushing = true;
    this.flushNext(queue);
  }

  private flushNext(queue: QueuedRequest[]): void {
    const [nextRequest, ...remaining] = queue;

    if (!nextRequest) {
      localStorage.removeItem(QUEUE_KEY);
      this.isFlushing = false;
      this.toast.success('Offline changes synced successfully');
      return;
    }

    this.http
      .request(nextRequest.method, nextRequest.url, {
        body: nextRequest.body
      })
      .subscribe({
        next: () => {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
          this.flushNext(remaining);
        },
        error: () => {
          localStorage.setItem(QUEUE_KEY, JSON.stringify([nextRequest, ...remaining]));
          this.isFlushing = false;
          this.toast.error('Some offline changes could not sync yet. They will retry later.');
        }
      });
  }
}
