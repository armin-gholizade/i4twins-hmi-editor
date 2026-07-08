import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SvgLabel {
  addLabel(
    svgRoot: SVGSVGElement,
    clientX: number,
    clientY: number,
    text: string,
    color: string
  ): void {
    const labelText = text.trim();

    if (!labelText) {
      return;
    }

    const point = this.toSvgPoint(svgRoot, clientX, clientY);
    const label = this.createTextElement(point.x, point.y, labelText, color);

    svgRoot.appendChild(label);
  }

  private toSvgPoint(
    svgRoot: SVGSVGElement,
    clientX: number,
    clientY: number
  ): DOMPoint {
    const point = svgRoot.createSVGPoint();

    point.x = clientX;
    point.y = clientY;

    const screenCtm = svgRoot.getScreenCTM();

    if (!screenCtm) {
      return new DOMPoint(clientX, clientY);
    }

    return point.matrixTransform(screenCtm.inverse());
  }

  private createTextElement(
    x: number,
    y: number,
    text: string,
    color: string
  ): SVGTextElement {
    const label = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );

    label.setAttribute('x', String(Math.round(x)));
    label.setAttribute('y', String(Math.round(y)));
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', '600');
    label.setAttribute('fill', color);
    label.setAttribute('stroke', '#ffffff');
    label.setAttribute('stroke-width', '0.4');
    label.setAttribute('paint-order', 'stroke');
    label.setAttribute('data-label', 'true');
    label.style.cursor = 'pointer';
    label.textContent = text;

    return label;
  }

  isLabel(target: EventTarget | null): target is SVGTextElement {
    return target instanceof SVGTextElement && target.dataset['label'] === 'true';
  }

  deleteLabel(label: SVGTextElement): void {
    label.remove();
  }
}