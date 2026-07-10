import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDialogService } from '../../../core/services/input-dialog';

@Component({
  selector: 'app-input-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-dialog.html',
  styleUrls: ['./input-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputDialogComponent {
  private readonly inputDialog = inject(InputDialogService);
  readonly dialog = this.inputDialog.dialog;
  readonly value = signal('');

  constructor() {
    effect(() => {
      this.dialog();
      this.value.set('');
    });
  }

  cancel(): void {
    this.inputDialog.close(null);
  }

  submit(): void {
    this.inputDialog.close(this.value().trim());
  }
}
