import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrls: ['./skeleton-loader.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonLoaderComponent {
  readonly rows = input(4);

  readonly placeholders = computed(() =>
    Array.from({ length: this.rows() }, (_, index) => index)
  );
}
