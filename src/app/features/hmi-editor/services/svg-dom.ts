import { Injectable } from '@angular/core';
import { SvgElementInfo } from '../models/svg-element-info';
import { SelectedSvgElement, SvgAttribute } from '../models/selected-svg-element';

@Injectable({
  providedIn: 'root',
})
export class SvgDom {
  private selectionBox: SVGRectElement | null = null;

  parse(svgText: string): SVGSVGElement {
    const document = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const parserError = document.querySelector('parsererror');

    if (parserError) {
      throw new Error('Invalid SVG file.');
    }

    const svg = document.querySelector('svg');

    if (!svg) {
      throw new Error('SVG root element was not found.');
    }

    return svg;
  }

  prepareForCanvas(svg: SVGSVGElement): SVGSVGElement {
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';

    svg.querySelectorAll<SVGElement>('*').forEach((element) => {
      element.style.cursor = 'pointer';
    });

    return svg;
  }

  render(host: HTMLElement, svg: SVGSVGElement): void {
    host.replaceChildren(svg);
  }

  discoverInteractiveElements(svg: SVGSVGElement): SvgElementInfo[] {
    const elements = Array.from(
      svg.querySelectorAll<SVGElement>('[data-device-id], [id]')
    );

    return elements.map((element) => ({
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.getAttribute('id'),
      deviceId: element.getAttribute('data-device-id'),
    }));
  }

  resolveSelectableElement(
    event: PointerEvent,
    svgRoot: SVGSVGElement | null
  ): SVGElement | null {

    if (!svgRoot) {
      return null;
    }

    const path = event.composedPath();

    for (const item of path) {
      if (!(item instanceof SVGElement) || item === svgRoot) {
        continue;
      }

      const deviceElement: any = item.closest<SVGElement>('[data-device-id]');
      if (deviceElement && deviceElement !== svgRoot && svgRoot.contains(deviceElement)) {
        return deviceElement;
      }

      const idElement: any = item.closest<SVGElement>('[id]');
      if (idElement && idElement !== svgRoot && svgRoot.contains(idElement)) {
        return idElement;
      }

      if (svgRoot.contains(item)) {
        return item;
      }
    }

    return null;
  }
  selectElement(element: SVGElement): SelectedSvgElement {
    this.clearSelection();
    this.drawSelectionBox(element);

    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.getAttribute('id'),
      deviceId: element.getAttribute('data-device-id'),
      attributes: this.getAttributes(element),
    };
  }

  clearSelection(): void {
    this.selectionBox?.remove();
    this.selectionBox = null;
  }

  getAttributes(element: SVGElement): SvgAttribute[] {
    return Array.from(element.attributes).map((attribute) => ({
      name: attribute.name,
      value: attribute.value,
    }));
  }

  private drawSelectionBox(element: SVGElement): void {
    const svg = element.ownerSVGElement;

    if (!svg || !(element instanceof SVGGraphicsElement)) {
      return;
    }

    const bbox = element.getBBox();
    const padding = 6;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    rect.setAttribute('x', String(bbox.x - padding));
    rect.setAttribute('y', String(bbox.y - padding));
    rect.setAttribute('width', String(bbox.width + padding * 2));
    rect.setAttribute('height', String(bbox.height + padding * 2));
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', '#1976d2');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('stroke-dasharray', '6 4');
    rect.setAttribute('pointer-events', 'none');

    svg.appendChild(rect);
    this.selectionBox = rect;
  }

  updateAttribute(
    element: SVGElement,
    name: string,
    value: string
  ): SelectedSvgElement {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      element.setAttribute(name, normalizedValue);
    } else {
      element.removeAttribute(name);
    }

    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.getAttribute('id'),
      deviceId: element.getAttribute('data-device-id'),
      attributes: this.getAttributes(element),
    };
  }
}