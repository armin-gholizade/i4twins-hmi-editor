import { Component, computed, effect, inject, signal } from '@angular/core';
import { EditorSelectionState } from '../../services/editor-selection-state';
import { FormsModule } from '@angular/forms';
import { SvgDom } from '../../services/svg-dom';
import { DeviceSearch } from '../../../devices/components/device-search/device-search';
@Component({
  selector: 'app-side-panel',
  imports: [FormsModule,DeviceSearch],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
})
export class SidePanel {
  private readonly svgDom = inject(SvgDom);

  protected readonly selectionState = inject(EditorSelectionState);
  protected readonly editedValues = signal<Record<string, string>>({});
  protected readonly feedbackMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const selected = this.selectionState.selectedElement();

      if (!selected) {
        this.editedValues.set({});
        return;
      }

      const values = selected.attributes.reduce<Record<string, string>>(
        (acc, attribute) => {
          acc[attribute.name] = attribute.value;
          return acc;
        },
        {}
      );

      this.editedValues.set(values);
    });
  }

  protected hasAttributeChanged(name: string, originalValue: string): boolean {
    return (this.editedValues()[name] ?? '') !== originalValue;
  }

  protected updateEditedValue(name: string, value: string): void {
    this.editedValues.update((current) => ({
      ...current,
      [name]: value,
    }));
  }

  protected saveAttribute(name: string): void {
    const selected = this.selectionState.selectedElement();

    if (!selected) {
      return;
    }

    const currentAttribute = selected.attributes.find(
      (attribute) => attribute.name === name
    );

    if (!currentAttribute || !this.hasAttributeChanged(name, currentAttribute.value)) {
      return;
    }

    const value = this.editedValues()[name] ?? '';
    const updated = this.svgDom.updateAttribute(selected.element, name, value);

    this.selectionState.updateSelection(updated);
    this.feedbackMessage.set('Attribute updated');

    window.setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 1800);
  }

}
