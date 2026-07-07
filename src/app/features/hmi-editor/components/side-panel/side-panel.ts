import { Component,inject  } from '@angular/core';
import { EditorSelectionState } from '../../services/editor-selection-state';

@Component({
  selector: 'app-side-panel',
  imports: [],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
})
export class SidePanel {
  protected readonly selectionState = inject(EditorSelectionState);

}
