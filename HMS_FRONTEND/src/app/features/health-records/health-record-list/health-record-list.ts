import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HealthRecordService } from '../../../core/services/health-record';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-health-record-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, SkeletonLoaderComponent],
  templateUrl: './health-record-list.html',
  styleUrls: ['./health-record-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HealthRecordList implements OnInit {
  readonly healthRecords = signal<any[]>([]);
  readonly isLoading = signal(false);
  readonly search = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly cursorStack = signal<string[]>(['']);
  readonly nextCursor = signal('');
  readonly meta = signal<any>({});

  constructor(
    private readonly healthRecordService: HealthRecordService
  ) {}

  ngOnInit(): void {
    this.loadHealthRecords();
  }

  loadHealthRecords(showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading.set(true);
    }

    this.healthRecordService
      .getHealthRecords({
        page: this.page(),
        limit: this.limit(),
        pagination: 'cursor',
        cursor: this.cursorStack()[this.page() - 1] || '',
        search: this.search()
      })
      .subscribe({
        next: (response) => {
          this.healthRecords.set(response.data);

          this.meta.set(response.meta);
          this.nextCursor.set(response.meta?.nextCursor || '');

          if (this.page() > 1 && this.healthRecords().length === 0) {
            this.page.set(Math.max(this.meta()?.totalPages || 1, 1));
            this.loadHealthRecords(false);
            return;
          }

          this.isLoading.set(false);
        },
        error: (error) => {
          console.log(error);

          this.isLoading.set(false);
        }
      });
  }

  onSearch(): void {
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');

    this.loadHealthRecords(false);
  }

  nextPage(): void {
    if (this.meta()?.hasNextPage && this.nextCursor()) {
      const stack = [...this.cursorStack()];
      stack[this.page()] = this.nextCursor();
      this.cursorStack.set(stack);
      this.page.update(p => p + 1);

      this.loadHealthRecords(false);
    }
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.nextCursor.set('');

      this.loadHealthRecords(false);
    }
  }

  onPageSizeChange(nextLimit: number): void {
    this.limit.set(nextLimit);
    this.page.set(1);
    this.cursorStack.set(['']);
    this.nextCursor.set('');
    this.loadHealthRecords(false);
  }
}
