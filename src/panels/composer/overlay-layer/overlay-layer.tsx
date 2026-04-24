import { useEffect, useRef, useState } from 'react';
import { Viewer } from 'openseadragon';
import { HoverLayer } from './hover-layer';
import { ToolLayer } from './tool-layer';
import { CanvasIndicator } from './canvas-indicator';

interface OverlayLayerProps {

  viewer?: Viewer;

}

export const OverlayLayer = (props: OverlayLayerProps) => {
  const { viewer } = props;

  const groupRef = useRef<SVGGElement>(null);

  const [containerSize, setContainerSize] = useState<{ x: number , y: number }>({ x: 0 , y: 0 });

  useEffect(() => {
    if (!viewer || !groupRef.current) return;

    const onUpdateViewport = () => {
      const bounds = viewer.viewport.getBounds(true);
      const containerSize = viewer.viewport.getContainerSize();

      const scaleX = containerSize.x / bounds.width;
      const scaleY = containerSize.y / bounds.height;

      const transform = 
        `scale(${scaleX}, ${scaleY}) translate(${-bounds.x}, ${-bounds.y})`;

      groupRef.current?.setAttribute('transform', transform);
    };

    const onResize = () => {
      const s = viewer.viewport.getContainerSize();
      setContainerSize({ x: s.x, y: s.y });
      onUpdateViewport();
    };

    viewer.addHandler('update-viewport', onUpdateViewport);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(viewer.container);

    return () => {
      viewer.removeHandler('update-viewport', onUpdateViewport);
      resizeObserver.disconnect();
    };
  }, [viewer]);

  return viewer ? (
    <svg
      viewBox={`0 0 ${containerSize.x} ${containerSize.y}`}
      className="absolute inset-0 size-full pointer-events-none">
      <g ref={groupRef} className="pointer-events-auto">
        <CanvasIndicator />
        <HoverLayer viewer={viewer} />
        <ToolLayer viewer={viewer} />
      </g>
    </svg>
  ) : null;

}