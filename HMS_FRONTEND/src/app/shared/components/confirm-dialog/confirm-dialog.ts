import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [NgClass],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  private readonly confirmDialog = inject(ConfirmDialogService);
  readonly dialog = this.confirmDialog.dialog;

  cancel(): void {
    this.confirmDialog.close(false);
  }

  confirm(): void {
    this.confirmDialog.close(true);
  }
}
