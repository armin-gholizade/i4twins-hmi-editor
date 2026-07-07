import { Injectable } from '@angular/core';
import { SvgElementInfo } from '../models/svg-element-info';

@Injectable({
  providedIn: 'root',
})
export class SvgDom {
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
}