import { Injectable, signal } from '@angular/core';
import { SelectedSvgElement } from '../models/selected-svg-element';

@Injectable({
  providedIn: 'root',
})
export class EditorSelectionState {
  readonly selectedElement = signal<SelectedSvgElement | null>(null);

  select(element: SelectedSvgElement): void {
    this.selectedElement.set(element);
  }

  updateSelection(element: SelectedSvgElement): void {
  this.selectedElement.set(element);
}

  clear(): void {
    this.selectedElement.set(null);
  }

}