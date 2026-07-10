import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
export class HealthRecordList implements OnInit, OnDestroy {
  healthRecords: any[] = [];

  isLoading = false;

  search = '';

  page = 1;

  limit = 10;
  cursorStack: string[] = [''];
  nextCursor = '';

  meta: any = {};

  private readonly searchInput$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.reloadFromFirstPage());

    this.applyHealthRecordsResponse(this.route.snapshot.data['healthRecords']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHealthRecords(showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading = true;
    }

    this.healthRecordService
      .getHealthRecords({
        page: this.page,
        limit: this.limit,
        pagination: 'cursor',
        cursor: this.cursorStack[this.page - 1] || '',
        search: this.search.trim()
      })
      .subscribe({
        next: (response) => {
          this.applyHealthRecordsResponse(response);

          if (this.page > 1 && this.healthRecords.length === 0) {
            this.page = Math.max(this.meta?.totalPages || 1, 1);
            this.loadHealthRecords(false);
            return;
          }

          this.isLoading = false;

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);

          this.isLoading = false;

          this.cdr.detectChanges();
        }
      });
  }

  onSearchInput(): void {
    this.searchInput$.next(this.search.trim());
  }

  onSearch(): void {
    this.reloadFromFirstPage();
  }

  nextPage(): void {
    if (this.meta?.hasNextPage && this.nextCursor) {
      this.cursorStack[this.page] = this.nextCursor;
      this.page++;

      this.loadHealthRecords(false);
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.nextCursor = '';

      this.loadHealthRecords(false);
    }
  }

  onPageSizeChange(nextLimit: number): void {
    this.limit = nextLimit;
    this.reloadFromFirstPage();
  }

  private reloadFromFirstPage(): void {
    this.resetPagination();
    this.loadHealthRecords(false);
  }

  private resetPagination(): void {
    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';
  }

  private applyHealthRecordsResponse(response: any): void {
    this.healthRecords = response?.data || [];
    this.meta = response?.meta || {};
    this.nextCursor = response?.meta?.nextCursor || '';
    this.isLoading = false;
  }
}



