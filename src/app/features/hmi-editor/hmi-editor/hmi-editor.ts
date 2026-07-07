import { Component } from '@angular/core';
import { EditorToolbar } from '../components/editor-toolbar/editor-toolbar';
import { SvgCanvas } from '../components/svg-canvas/svg-canvas';
import { SidePanel } from '../components/side-panel/side-panel';

@Component({
  selector: 'app-hmi-editor',
  imports: [EditorToolbar, SvgCanvas, SidePanel],
  templateUrl: './hmi-editor.html',
  styleUrl: './hmi-editor.scss',
})
export class HmiEditor {}