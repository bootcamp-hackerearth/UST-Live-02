import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { RouterLink } from '@angular/router';

import { HealthRecordService } from '../../../core/services/health-record';

import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-health-record-list',

  standalone: true,

  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],

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

  meta: any = {};

  constructor(
    private readonly healthRecordService: HealthRecordService,

    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHealthRecords();
  }

  loadHealthRecords(showPageLoader = true): void {
    if (showPageLoader) {
      this.isLoading = true;
    }

    this.healthRecordService
      .getHealthRecords({
        page: this.page,
        limit: this.limit,
        search: this.search
      })
      .subscribe({
        next: (response) => {
          this.healthRecords = response.data;

          this.meta = response.meta;

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

    this.loadHealthRecords(false);
  }

  nextPage(): void {
    if (this.meta?.hasNextPage) {
      this.page++;

      this.loadHealthRecords(false);
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;

      this.loadHealthRecords(false);
    }
  }
}
