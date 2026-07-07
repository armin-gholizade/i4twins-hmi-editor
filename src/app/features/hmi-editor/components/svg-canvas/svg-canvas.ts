import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SvgDom } from '../../services/svg-dom';

@Component({
  selector: 'app-svg-canvas',
  imports: [],
  templateUrl: './svg-canvas.html',
  styleUrl: './svg-canvas.scss',
})
export class SvgCanvas implements AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly svgDom = inject(SvgDom);

  protected readonly svgHost =
    viewChild.required<ElementRef<HTMLDivElement>>('svgHost');

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.loadSvg('/assets/plant.svg');
  }

  private loadSvg(path: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (svgText) => this.renderSvg(svgText),
      error: () => this.handleLoadError(),
    });
  }

  private renderSvg(svgText: string): void {
    try {
      const svg = this.svgDom.prepareForCanvas(this.svgDom.parse(svgText));
      this.svgDom.render(this.svgHost().nativeElement, svg);
    } catch {
      this.errorMessage.set('The SVG drawing could not be rendered.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleLoadError(): void {
    this.errorMessage.set('Could not load the SVG drawing.');
    this.isLoading.set(false);
  }
}