export interface SvgAttribute {
  name: string;
  value: string;
}

export interface SelectedSvgElement {
  element: SVGElement;
  tagName: string;
  id: string | null;
  deviceId: string | null;
  attributes: SvgAttribute[];
}