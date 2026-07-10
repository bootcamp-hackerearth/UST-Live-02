import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  @Input()
  page = 1;

  @Input()
  totalPages = 1;

  @Input()
  totalRecords = 0;

  @Input()
  limit = 10;
  @Input()
  showPageSize = true;

  @Input()
  cursorMode = false;

  @Input()
  hasNextPage = false;

  @Output()
  previous = new EventEmitter<void>();

  @Output()
  next = new EventEmitter<void>();

  @Output()
  pageSizeChange = new EventEmitter<number>();

  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.pageSizeChange.emit(Number(select.value));
  }
}
