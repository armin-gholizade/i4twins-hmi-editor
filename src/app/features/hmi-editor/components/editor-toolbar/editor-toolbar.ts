import { Component, inject } from '@angular/core';
import { Preview } from '../../../preview/services/preview';

@Component({
  selector: 'app-editor-toolbar',
  imports: [],
  templateUrl: './editor-toolbar.html',
  styleUrl: './editor-toolbar.scss',
})
export class EditorToolbar {
  protected readonly preview = inject(Preview);

  protected onPreviewChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.preview.toggle(input.checked);
  }
}
