import type { CozyCanvas, CozyManifest } from 'cozy-iiif';

export interface Project {

  sources: SourceManifest[];

  reconstruction: ReconstructionCanvas[];

}

export interface SourceManifest {

  id: string;

  manifestUrl: string;
  
  manifest: CozyManifest;

  expanded?: boolean;

}

export interface ReconstructionCanvas {

  id: string;

  sourceManifestId?: string;

  canvas: CozyCanvas;

  order: number;

}

export interface Selection {

  type: 'manifest' | 'source_canvas' | 'reconstruction_canvas';

  manifestId?: string;

  sourceCanvasId?: string;

  reconstructionCanvasId?: string;

}
