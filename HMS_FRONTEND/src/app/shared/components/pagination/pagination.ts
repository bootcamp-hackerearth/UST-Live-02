import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class PaginationComponent {
  @Input() pagination = {
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };

  @Input() totalLabel = 'records';
  @Input() showPageSize = true;

  @Output() pagePrevious = new EventEmitter<void>();
  @Output() pageNext = new EventEmitter<void>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onLimitChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;

    this.pageSizeChange.emit(Number(selectElement.value));
  }
}
