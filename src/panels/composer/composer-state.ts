import { create } from 'zustand';
import { Viewer } from 'openseadragon';
import type { CozyCanvas } from 'cozy-iiif';
import { hydrateCanvas } from 'cozy-iiif/helpers';
import type { DraggableImage } from './composer-types';
import { createCanvasWorld } from './canvas-world';
import { getReconstructionID } from '@/store';

const BASE_ID = `${getReconstructionID()}/canvas`;

export interface ComposerState {

  viewer?: Viewer;

  images: DraggableImage[];

  canvasWidth: number;

  canvasHeight: number;

  hoveredId: string | null;

  selectedId: string | null;

  saving: boolean;

  setViewer(viewer?: Viewer): void;

  addCanvas(canvas: CozyCanvas, clearOthers?: boolean): void;

  setHoveredId(id?: string | null): void;

  setSelectedId(id?: string | null): void;

  updateImage(id: string, updated: DraggableImage): void;

  reset(): void;

  getCanvas(): CozyCanvas | undefined;

  setSaving(saving: boolean): void;

}

export const useComposerState = create<ComposerState>((set, get) => ({

  viewer: undefined,

  images: [],

  hoveredId: null,

  selectedId: null,

  canvasWidth: 0,

  canvasHeight: 0,

  saving: false,

  setViewer: (viewer?: Viewer) => set({ viewer }),

  addCanvas: (canvas, clearOthers) => {
    const { images } = get();
    
    const toAdd: DraggableImage[] = canvas.images.map((image, idx) => {
      const x = image.target ? image.target.x / canvas!.width : 0;
      const y = image.target ? image.target.y / canvas!.width : 0;
      const width = image.target ? image.target.w / canvas!.width : 1;

      return {
        id: crypto.randomUUID(),
        tileSource: image.type === 'dynamic' || image.type === 'level0' ? image.serviceUrl : {
          type: 'image',
          url: image.getImageURL()
        },
        image,
        x,
        y,
        width,
        index: images.length + idx + 1
      }
    });

    if (images.length === 0 || clearOthers) {
      // Initialize canvas dimensions with the size of this canvas
      set(state => ({
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        images: clearOthers ? toAdd : [...state.images, ...toAdd],
        selectedId: null,
        hoveredId: null
      }));
    } else {
      set(state => ({
        images: [...state.images, ...toAdd],
        selectedId: null,
        hoveredId: null
      }));
    }
  },

  getCanvas: () => {
    const { images, viewer, canvasWidth, canvasHeight } = get();
    if (!viewer) return;

    const world = createCanvasWorld(viewer, images, canvasWidth, canvasHeight);

    const canvasId = `${BASE_ID}/${crypto.randomUUID()}`;

    const canvas = {
      id: canvasId,
      type: 'Canvas',
      label: { en: ['Canvas'] },
      width: world.width,
      height: world.height,
      items: [{
        id: `${canvasId}/page/${crypto.randomUUID()}`,
        type: 'AnnotationPage',
        items: world.images.map(image => ({
          id: `${canvasId}/annotations/${crypto.randomUUID()}`,
          type: 'Annotation',
          motivation: 'painting',
          body: {
            ...image.source.image.source
          },
          target: image.on ? `${canvasId}#xywh=${image.on.join(',')}` : canvasId 
        }))
      }]
    }

    return hydrateCanvas({ source: canvas } as unknown as CozyCanvas);
  },
  
  setHoveredId: id => set(() => ({
    hoveredId: id || null,
  })),

  setSelectedId: id => set(() => ({
    selectedId: id || null,
  })),

  updateImage: (id, updated) => set(state => ({
    images: state.images.map(image =>
      image.id === id ? { ...image, ...updated } : image)
  })),

  reset: () => set(() => ({
    images: [],
    canvasWidth: 0,
    canvasHeight: 0,
    hoveredId: null,
    selectedId: null
  })),

  setSaving: saving => set(() => ({ saving }))

}));