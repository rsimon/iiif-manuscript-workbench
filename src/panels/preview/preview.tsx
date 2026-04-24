import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
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

    // TODO just a hack for now
    canvas!.images.forEach((image, idx) => {
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
            index: idx + 1 
          });
        } else {
          viewer.addTiledImage({ tileSource });
        }
      } else {
        // TODO
      }
    });

    return () => {
      viewer.world.removeAll();
    }
  }, [selection?.sourceCanvasId, selection?.reconstructionCanvasId, viewer]);

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={elementRef} className="size-full bg-neutral-50 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px]" /> 
    </div>
  )

}