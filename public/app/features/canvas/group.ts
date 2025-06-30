// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { CanvasElementOptions } from './element';

export interface CanvasGroupOptions extends CanvasElementOptions {
  type: 'group';
  elements: CanvasElementOptions[];
  // layout? // absolute, list, grid?
}
