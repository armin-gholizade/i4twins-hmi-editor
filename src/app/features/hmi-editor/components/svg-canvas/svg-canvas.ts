import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { effect } from '@angular/core';
import { DeviceStore } from '../../../devices/services/device-store';
import { HttpClient } from '@angular/common/http';
import { EditorSelectionState } from '../../services/editor-selection-state';
import { SvgDom } from '../../services/svg-dom';

import { SvgElementInfo } from '../../models/svg-element-info';
import { SelectedSvgElement } from '../../models/selected-svg-element';
import { Preview } from '../../../preview/services/preview';
import { StatusColor } from '../../../preview/services/status-color';
import { SvgLabel } from '../../services/svg-label';
import { MatDialog } from '@angular/material/dialog';
import {
  LabelDialog,
  LabelDialogResult,
} from '../label-dialog/label-dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-svg-canvas',
  imports: [],
  templateUrl: './svg-canvas.html',
  styleUrl: './svg-canvas.scss',
})
export class SvgCanvas implements AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly svgDom = inject(SvgDom);
  private readonly selectionState = inject(EditorSelectionState);
  private readonly deviceStore = inject(DeviceStore);
  private readonly preview = inject(Preview);
  private readonly statusColor = inject(StatusColor);
  private readonly svgLabel = inject(SvgLabel);
  private readonly dialog = inject(MatDialog);

  protected readonly svgHost =
    viewChild.required<ElementRef<HTMLDivElement>>('svgHost');

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly elements = signal<SvgElementInfo[]>([]);
  protected readonly selectedElement = signal<SelectedSvgElement | null>(null);

  private svgRoot: SVGSVGElement | null = null;
  private lastProcessedDeviceId: string | null = null;

  constructor() {
    effect(() => {
      const enabled = this.preview.isEnabled();
      const devicesById = this.preview.devicesById();

      const svgRoot =
        this.svgRoot ??
        this.svgHost().nativeElement.querySelector<SVGSVGElement>('svg');

      if (!enabled) {
        this.svgDom.clearPreviewColors(svgRoot);
        return;
      }

      this.svgDom.applyPreviewColors(svgRoot, devicesById, (status: any) =>
        this.statusColor.getColor(status)
      );
    });

    effect(() => {
      const selectedDevice = this.deviceStore.selectedDevice();

      if (!selectedDevice) {
        this.lastProcessedDeviceId = null;
        return;
      }

      const deviceId = selectedDevice.id.trim().toLowerCase();

      if (this.lastProcessedDeviceId === deviceId) {
        return;
      }

      const svgRoot =
        this.svgRoot ??
        this.svgHost().nativeElement.querySelector<SVGSVGElement>('svg');

      const svgElement = this.svgDom.findElementByDeviceId(
        svgRoot,
        selectedDevice.id
      );

      if (!svgElement) {
        this.svgDom.clearSelection();
        this.selectedElement.set(null);
        this.selectionState.clear();
        untracked(() => {
          this.deviceStore.markSelectedDeviceMissingInDrawing();
        });
        return;
      }

      const selectedSvgElement = this.svgDom.selectElement(svgElement);

      this.selectedElement.set(selectedSvgElement);
      this.selectionState.select(selectedSvgElement);
      untracked(() => {
        this.deviceStore.confirmDeviceInDrawing(selectedDevice);
      });
    });
  }

  ngAfterViewInit(): void {
    this.loadSvg('/assets/plant.svg');
  }

  protected onCanvasContextMenu(event: MouseEvent): void {
    event.preventDefault();

    if (this.preview.isEnabled()) {
      return;
    }

    const target = event.target;

    if (this.svgLabel.isLabel(target)) {
      this.dialog
        .open<ConfirmDialog, void, boolean>(ConfirmDialog, {
          width: '360px',
          autoFocus: false,
        })
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.svgLabel.deleteLabel(target);
          }
        });

      return;
    }

    const svgRoot =
      this.svgRoot ??
      this.svgHost().nativeElement.querySelector<SVGSVGElement>('svg');

    if (!svgRoot) {
      return;
    }

    this.dialog
      .open<LabelDialog, void, LabelDialogResult>(LabelDialog, {
        width: '420px',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.svgLabel.addLabel(
          svgRoot,
          event.clientX,
          event.clientY,
          result.text,
          result.color
        );
      });
  }

  protected onCanvasPointerDown(event: PointerEvent): void {
    if (this.preview.isEnabled()) {
      return;
    }
    const svgRoot =
      this.svgRoot ??
      this.svgHost().nativeElement.querySelector<SVGSVGElement>('svg');

    const element = this.svgDom.resolveSelectableElement(event, svgRoot);

    if (!element) {
      this.svgDom.clearSelection();
      this.selectedElement.set(null);
      this.selectionState.clear();
      return;
    }
    const selected = this.svgDom.selectElement(element);

    this.selectedElement.set(selected);
    this.selectionState.select(selected);

    if (selected.deviceId) {
      this.deviceStore.selectDeviceById(selected.deviceId);
    } else {
      this.deviceStore.clearSelection();
    }
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
      this.svgRoot = svg;
      this.svgDom.render(this.svgHost().nativeElement, svg);
      this.elements.set(this.svgDom.discoverInteractiveElements(svg));
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