import { useEffect, useRef } from 'react';
import { Puzzle } from 'lucide-react';
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
  const activeCanvasLabel = useWorkspaceStore(state => 
    state.project?.reconstruction.find(rc => rc.id === state.composerActiveCanvasId)?.canvas.getLabel()
  );

  const dirty = useComposerState(state => state.dirty);
  const setDirty = useComposerState(state => state.setDirty);

  const viewer = useComposerState(state => state.viewer);
  const images = useComposerState(state => state.images);
  const canvasWidth = useComposerState(state => state.canvasWidth);
  const canvasHeight = useComposerState(state => state.canvasHeight);

  const getCanvas = useComposerState(state => state.getCanvas);
  const deleteImage = useComposerState(state => state.deleteImage);
  const setCanvasLabel = useComposerState(state => state.setCanvasLabel);
  const setSaving= useComposerState(state => state.setSaving);

  const imagesRef = useRef(images);

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
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    if (!composerActiveCanvasId || !activeCanvasLabel) return;
    setCanvasLabel(activeCanvasLabel);

    props.api.updateParameters({ 
      tabTitle: `Canvas Composer [${activeCanvasLabel|| 'Untitled Canvas'}]`
    });
  }, [activeCanvasLabel]);

  useEffect(() => {
    if (composerActiveCanvasId) {
      const rc = (project?.reconstruction || []).find(rc => rc.id === composerActiveCanvasId);
      if (!rc) return; // Should never happen

      // Add canvas to composer state
      addCanvas(rc.canvas, true);

      // Update tab title
      props.api.updateParameters({ 
        tabTitle: `Canvas Composer [${rc.canvas.getLabel() || 'Untitled Canvas'}]`
      });

      props.api.setActive();
    } else {
      reset();
      props.api.updateParameters({ tabTitle: `Canvas Composer` });
    }
  }, [composerActiveCanvasId]);

  useEffect(() => {
    let cancelled = false;

    const fitHome = (viewer: Viewer) => {
      const aspectRatio = canvasWidth / canvasHeight;
      const canvasRect = new OpenSeadragon.Rect(-0.15, -0.12, 1.3, 1.3 / aspectRatio);
      viewer.viewport.fitBounds(canvasRect, true);
    }

    const renderImages = () => {
      if (!viewerRef.current) return;
      const viewer = viewerRef.current;

      if (imagesRef.current.length === 0) {
        viewer.world.removeAll(); 

        viewer.addTiledImage({
          tileSource: {
            type: 'legacy-image-pyramid',
            levels: [{
              url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // 1x1 transparent GIF
              width: 2000,
              height: 2000
            }]
          },
          opacity: 0,
        });

        fitHome(viewer);

        return;
      }

      Promise.all(imagesRef.current.map(i => {
        if (typeof i.tileSource === 'string') {
          return fetch(i.tileSource).then(res => res.json()).then(tileSource => {    
            return {
              ...i,
              tileSource
            }
          });
        } else {
          // Warning: OSD mutates TiledImages in place - do a simple 'deep clone' 
          return Promise.resolve({
            ...i,
            tileSource: {...i.tileSource }
          });
        }
      })).then(resolvedSources => {
        if (cancelled) return; // discard stale result

        viewer.world.removeAll();
        resolvedSources.forEach(i => viewer.addTiledImage(i));

        fitHome(viewer);

        setTimeout(() => {
          if (images.length > 0)
            onSaveCanvas();
        }, 100);
      }).catch(error => {
        console.error(error);
      })
    }

    if (props.api.isVisible)
      renderImages();

    // Otherwise, init when tab first opens
    const { dispose } = props.api.onDidVisibilityChange(({ isVisible }) => {
      if (isVisible) renderImages();
    });

    return () => {
      cancelled = true;
      dispose();
    }
  }, [images.length === 0 ? 'empty' : images.map(i => i.id).join('.'), canvasWidth, canvasHeight, props.api]);

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

        // @ts-ignore
        viewerRef.current.viewport.resize(newSize, true); 
        viewerRef.current.viewport.update(); 
      }
    });

    return () => dispose();
  }, []);

  const onSaveCanvas = () => {
    if (!composerActiveCanvasId || !dirty) return;

    setSaving(true);

    requestAnimationFrame(() => {
      const canvas = getCanvas();
      if (!canvas) return;
      updateReconstructionCanvas(composerActiveCanvasId, canvas);
      setDirty(false);

      setTimeout(() => setSaving(false), 500);
    });
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1">
        <div 
          ref={containerRef} 
          className="size-full bg-neutral-100 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px] [&>.openseadragon-container]:z-10 shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.07),inset_0_1px_3px_0_rgba(0,0,0,0.06)]">
          <OverlayLayer 
            viewer={viewer} 
            onCanvasUpdated={onSaveCanvas} />
        </div>

        {composerActiveCanvasId ? (
          <Toolbar 
            onDeleteImage={deleteImage} />
        ): (
          <div className="absolute bg-white inset-0 flex size-full items-center justify-center p-4">
            <div className="text-center flex flex-col gap-3">
              <Puzzle className="mx-auto size-8 text-neutral-300" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground/65 max-w-xs leading-relaxed">
                Double-click a canvas in the Reconstruction to edit it in the Composer
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}