import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface LabelDialogResult {
  text: string;
  color: string;
}

@Component({
  selector: 'app-label-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './label-dialog.html',
  styleUrl: './label-dialog.scss',
})
export class LabelDialog {
  private readonly dialogRef = inject(MatDialogRef<LabelDialog, LabelDialogResult>);

  protected text = '';
  protected color = '#1e293b';

  protected save(): void {
    const trimmedText = this.text.trim();

    if (!trimmedText) {
      return;
    }

    this.dialogRef.close({
      text: trimmedText,
      color: this.color,
    });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}