import { Component, signal } from '@angular/core';
import { HmiEditor } from './features/hmi-editor/hmi-editor/hmi-editor';

@Component({
  selector: 'app-root',
  imports: [HmiEditor],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // protected readonly title = signal('i4twins-hmi-editor');
}
