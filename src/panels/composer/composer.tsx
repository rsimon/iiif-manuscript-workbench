import { useEffect, useRef} from 'react';
import OpenSeadragon from 'openseadragon';
import { useWorkspaceStore } from '@/store';
import { useComposerState } from './composer-state';
import { OverlayLayer } from './overlay-layer';
import { Toolbar } from './toolbar';

export const Composer = () => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const project = useWorkspaceStore(state => state.project);
  const updateReconstructionCanvas = useWorkspaceStore(state => state.updateReconstructionCanvas);
  const composerActiveCanvasId = useWorkspaceStore(state => state.composerActiveCanvasId);

  const getCanvas = useComposerState(state => state.getCanvas);

  const viewer = useComposerState(state => state.viewer);
  const images = useComposerState(state => state.images);

  const setViewer = useComposerState(state => state.setViewer);
  const addCanvas = useComposerState(state => state.addCanvas);
  const reset = useComposerState(state => state.reset);

  useEffect(() => {
    if (!project || !elementRef.current) return;

    reset();

    const v = OpenSeadragon({
      element: elementRef.current,
      showNavigationControl: false,
      preserveViewport: true,
      maxZoomPixelRatio: Infinity,
      minZoomImageRatio: 0,
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true
      }
    });

    setViewer(v);

    if (composerActiveCanvasId) {
      const rc = (project?.reconstruction || []).find(rc => rc.id === composerActiveCanvasId);
      if (!rc) return; // Should never happen

      addCanvas(rc.canvas);
    }

    return () => {
      v.destroy();
      setViewer(undefined);
    };
  }, [project, composerActiveCanvasId]);

  useEffect(() => {
    if (!viewer) return;

    viewer.world.removeAll();

    // Warning: OSD mutates TiledImages in place - do a simple 'deep clone' 
    images.forEach(i => viewer.addTiledImage({
      ...i, 
      tileSource: typeof i.tileSource === 'string' ? i.tileSource : {...i.tileSource }
    }));
  }, [images.map(i => i.id).join(':'), viewer]);

  const onSaveCanvas = () => {
    if (!composerActiveCanvasId) return;

    const canvas = getCanvas();
    if (!canvas) return;

    updateReconstructionCanvas(composerActiveCanvasId, canvas);
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1">
        <div ref={elementRef} className="size-full bg-neutral-50 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px]">
          <OverlayLayer viewer={viewer} />
        </div>

        <Toolbar onSave={onSaveCanvas} />
      </div>
    </div>
  )

}