import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import type { CozyImageResource } from 'cozy-iiif';
import { useWorkspaceStore } from '@/store';

export const Preview = () => {
  const project = useWorkspaceStore(state => state.project);
  const selection = useWorkspaceStore(state => state.selection);

  const elementRef = useRef<HTMLDivElement | null>(null);

  const [viewer, setViewer] = useState<OpenSeadragon.Viewer>();
  
  useEffect(() => {
    if (!elementRef.current) return;

    const v = OpenSeadragon({
      element: elementRef.current,
      showNavigationControl: false,
      maxZoomPixelRatio: Infinity,
      minZoomImageRatio: 0,
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true
      },
      viewportMargins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    });

    setViewer(v);

    return () => {
      v.destroy();
      setViewer(undefined);
    };
  }, []);

  useEffect(() => {
    if (!viewer || !selection || !project) return 
    if (selection.type === 'manifest') return;

    const { sourceCanvasId, reconstructionCanvasId, manifestId } = selection;
    const isValidSourceCanvas = sourceCanvasId && manifestId;

    const canvas = 
      isValidSourceCanvas ? project.sources.find(s => s.id === manifestId)
        ?.manifest
        ?.canvases
        ?.find(canvas => canvas.id === sourceCanvasId) :
      reconstructionCanvasId ? project.reconstruction.find(c => c.id === reconstructionCanvasId)?.canvas : undefined;
    
    if (!((canvas?.images || []).length > 0)) return;

    const addImage = (image: CozyImageResource) => new Promise<void>(resolve => {
      if (image.type === 'dynamic' || image.type === 'level0') {
        const tileSource = image.serviceUrl;

        if (image.target) {
          const x = image.target.x / canvas!.width;
          const y = image.target.y / canvas!.width;
          const width = image.target.w / canvas!.width;

          viewer.addTiledImage({ 
            tileSource,
            x,
            y,
            width,
            success: () => resolve()
          });
        } else {
          viewer.addTiledImage({ tileSource, success: () => resolve() });
        }
      } else {
        // TODO
      }
    });

    Promise.all(canvas!.images.map(addImage)).then(() => {
      const aspectRatio = canvas!.width / canvas!.height;
      const canvasRect = new OpenSeadragon.Rect(0, 0, 1, 1 / aspectRatio);
      viewer.viewport.fitBounds(canvasRect, true);
    });

    return () => {
      viewer.world.removeAll();
    }
  }, [selection?.sourceCanvasId, selection?.reconstructionCanvasId, viewer]);

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={elementRef} className="size-full bg-neutral-100" /> 
    </div>
  )

}