import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
export class HealthRecordList implements OnInit {
  healthRecords: any[] = [];

  isLoading = false;

  search = '';

  page = 1;

  limit = 10;
  cursorStack: string[] = [''];
  nextCursor = '';

  meta: any = {};

  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.applyHealthRecordsResponse(this.route.snapshot.data['healthRecords']);
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
        search: this.search
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

  onSearch(): void {
    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';

    this.loadHealthRecords(false);
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
    this.page = 1;
    this.cursorStack = [''];
    this.nextCursor = '';
    this.loadHealthRecords(false);
  }

  private applyHealthRecordsResponse(response: any): void {
    this.healthRecords = response?.data || [];
    this.meta = response?.meta || {};
    this.nextCursor = response?.meta?.nextCursor || '';
    this.isLoading = false;
  }
}
