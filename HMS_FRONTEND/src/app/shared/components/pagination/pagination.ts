import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
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
  readonly page = input(1);
  readonly totalPages = input(1);
  readonly totalRecords = input(0);
  readonly limit = input(10);
  readonly showPageSize = input(true);
  readonly cursorMode = input(false);
  readonly hasNextPage = input(false);

  readonly previous = output<void>();
  readonly next = output<void>();
  readonly pageSizeChange = output<number>();

  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.pageSizeChange.emit(Number(select.value));
  }
}
