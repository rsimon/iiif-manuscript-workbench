import type { CozyImageResource } from 'cozy-iiif';

export interface DraggableImage {

  id: string;

  tileSource: object | string;

  image: CozyImageResource;

  x: number;

  y: number;

  width: number;

  index: number;

}

export type CornerHandleType = 
  | 'TOP_LEFT'
  | 'TOP_RIGHT'
  | 'BOTTOM_RIGHT'
  | 'BOTTOM_LEFT';

export type EdgeHandleType = 
  | 'TOP'
  | 'RIGHT'
  | 'BOTTOM'
  | 'LEFT';

export type ResizeHandleType =
  | CornerHandleType
  | EdgeHandleType;

export type HandleType = 
  | 'SHAPE'
  | ResizeHandleType;