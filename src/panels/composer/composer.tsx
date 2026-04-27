import { useEffect, useRef} from 'react';
import type { IDockviewPanelProps } from 'dockview-react';
import OpenSeadragon, { type Viewer } from 'openseadragon';
import { useWorkspaceStore } from '@/store';
import { useComposerState } from './composer-state';
import { OverlayLayer } from './overlay-layer';
import { Toolbar } from './toolbar';

export const Composer = (props: IDockviewPanelProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);

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
    // Dockview mounts the composer panel during init, but keeps it hidden.
    // This means OSD would fail at this state
    const initOSD = () => {
      if (viewerRef.current || !containerRef.current) return;
      viewerRef.current = OpenSeadragon({
        element: containerRef.current,
        showNavigationControl: false,
        preserveViewport: true,
        maxZoomPixelRatio: Infinity,
        minZoomImageRatio: 0,
        gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true
        }
      });

      setViewer(viewerRef.current);
    }

    if (props.api.isVisible)
      // Open initially? Init now.
      initOSD();

    // Otherwise, init when tab first opens
    const { dispose } = props.api.onDidVisibilityChange(({ isVisible }) => {
      if (isVisible) initOSD();
    });

    return () => {
      dispose();
      reset();
      viewerRef.current?.destroy();
      viewerRef.current = null;
      setViewer(undefined);
    };
  }, []);

  useEffect(() => {
    reset();

    if (composerActiveCanvasId) {
      const rc = (project?.reconstruction || []).find(rc => rc.id === composerActiveCanvasId);
      if (!rc) return; // Should never happen

      // Add canvas to composer state
      addCanvas(rc.canvas);

      // Update tab title
      props.api.updateParameters({ 
        tabTitle: `Canvas Composer [${rc.canvas.getLabel() || 'Untitled Canvas'}]`
      });

      props.api.setActive();
    } else {
      props.api.updateParameters({ tabTitle: `Canvas Composer` });
    }
  }, [composerActiveCanvasId]);

  useEffect(() => {
    const renderImages = () => {
      if (!viewerRef.current) return;
      const viewer = viewerRef.current;
      
      viewer.world.removeAll();

      // Warning: OSD mutates TiledImages in place - do a simple 'deep clone' 
      images.forEach(i => viewer.addTiledImage({
        ...i, 
        tileSource: typeof i.tileSource === 'string' ? i.tileSource : {...i.tileSource }
      }));
    }

    if (props.api.isVisible)
      renderImages();

    // Otherwise, init when tab first opens
    const { dispose } = props.api.onDidVisibilityChange(({ isVisible }) => {
      if (isVisible) renderImages();
    });

    return () => {
      dispose();
    }
  }, [images.map(i => i.id).join(':')]);

  useEffect(() => {
    const { dispose } = props.api.onDidVisibilityChange(({ isVisible }) => {
      if (isVisible && viewerRef.current) {
        // OSD doesn't properly react to tab visibility changes. This may
        // cause it to operate on a stale (0x0px) viewer element. Forcing
        // a resize to the correct viewer element size after visibility change 
        // seems to resolve this. 
        const newSize = new OpenSeadragon.Point(
          containerRef.current?.clientWidth,
          containerRef.current?.clientHeight
        );

        viewerRef.current.viewport.resize(newSize, true); 
        viewerRef.current.viewport.update(); 
      }
    });

    return () => dispose();
  }, []);

  const onSaveCanvas = () => {
    if (!composerActiveCanvasId) return;

    const canvas = getCanvas();
    if (!canvas) return;

    updateReconstructionCanvas(composerActiveCanvasId, canvas);
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1">
        <div ref={containerRef} className="size-full bg-neutral-50 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px]">
          <OverlayLayer viewer={viewer} />
        </div>

        <Toolbar onSave={onSaveCanvas} />
      </div>
    </div>
  )

}