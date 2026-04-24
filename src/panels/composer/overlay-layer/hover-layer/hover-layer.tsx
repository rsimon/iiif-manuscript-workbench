import { useEffect, useMemo } from 'react';
import { Point, type Viewer } from 'openseadragon';
import { cornersToSvgPoints, getImageAt, getImageCorners } from '../overlay-utils';
import { useHoverManager } from './use-hover-manager';
import { useComposerState } from '../../composer-state';

interface HoverLayerProps {

  viewer: Viewer;

}

const pointsToPathString = (points: string): string => {
  const coords = points.trim().split(/\s+/);
  return coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join(' ') + ' Z';
};

// Bit of a hack
const COVER = 'M-999999,-999999 L999999,-999999 L999999,999999 L-999999,999999 Z';

export const HoverLayer = (props: HoverLayerProps) => {
  const { viewer } = props;

  const [hovered, setHovered] = useHoverManager();

  const selectedId = useComposerState(state => state.selectedId);

  useEffect(() => {
    if (!viewer) return;

    const onPointerMove = (event: PointerEvent) => {
      const point = new Point(event.offsetX, event.offsetY);
      const hovered = getImageAt(viewer, point);
      setHovered(hovered);
    }

    viewer.canvas.addEventListener('pointermove', onPointerMove);

    return () => {
      viewer.canvas?.removeEventListener('pointermove', onPointerMove);
    };
  }, [viewer]);

  const points = useMemo(() => {
    if (!hovered) return;
    const corners = getImageCorners(hovered.osdImage);
    return cornersToSvgPoints(corners);
  }, [hovered]);

  return (hovered && !selectedId) ? (
    <g>
      <path
        d={`${COVER} ${pointsToPathString(points!)}`}
        className="pointer-events-none"
        fill="#000"
        fillOpacity={0.65}
        fillRule="evenodd"
        stroke="none" />

      <polygon
        points={points}
        className="pointer-events-none"
        fill="none"
        stroke="white"
        strokeWidth={4}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke" />

      <polygon
        points={points}
        className="pointer-events-none"
        fill="none"
        stroke="black"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeDasharray="4 1" 
        strokeLinejoin="round" />
    </g>
  ) : null;

}