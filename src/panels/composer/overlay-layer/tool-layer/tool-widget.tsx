import { useEffect, useMemo, useState } from 'react';
import { Placement, Point, Rect, type Viewer } from 'openseadragon';
import { useComposerState } from '../../composer-state';
import { cornersToSvgPoints, getImageCorners } from '../overlay-utils';
import type { SelectedImage } from './use-selection-manager';
import { ToolCornerHandle } from './tool-corner-handle';
import type { CornerHandleType, DraggableImage, HandleType, ResizeHandleType } from '../../composer-types';

interface ToolWidgetProps {

  viewer: Viewer;

  selected: SelectedImage;

}

const HANDLE_TYPES: CornerHandleType[] = [
  'TOP_LEFT',
  'TOP_RIGHT',
  'BOTTOM_RIGHT',
  'BOTTOM_LEFT'
];

export const ToolWidget = (props: ToolWidgetProps) => {
  const { viewport } = props.viewer;

  // Keep a ref to the selected shape bounds at selection time
  const [initialBounds, setInitialBounds] = useState<Rect>();

  const [origin, setOrigin] = useState<Point>();

  const updateImage = useComposerState(state => state.updateImage);

  useEffect(() => {
    setOrigin(undefined);
    setInitialBounds(props.selected.osdImage.getBounds());
  }, [props.selected.id]);

  const corners = useMemo(() => {
    if (!props.selected) [];
    return getImageCorners(props.selected.osdImage);
  }, [props.selected]);

  const onMoveImage = (delta: number[]) => {
    if (!initialBounds) return;

    const nextPosition = new Point(initialBounds.x + delta[0], initialBounds.y + delta[1]);

    // Mutate OSD image in place
    props.selected.osdImage.setPosition(nextPosition, true);
    
    const { osdImage, ...rest } = props.selected;

    const updated: DraggableImage = {
      ...rest,
      x: nextPosition.x,
      y: nextPosition.y
    }

    updateImage(props.selected.id, updated);
  }

  const onResizeImage = (handle: ResizeHandleType, delta: number[]) => {
    if (!initialBounds) return;

    const [dx, dy] = delta;

    let x0 = initialBounds.x;
    let y0 = initialBounds.y;
    let x1 = initialBounds.x + initialBounds.width;
    let y1 = initialBounds.y + initialBounds.height;

    switch (handle) {
      case 'LEFT':
      case 'TOP_LEFT':
      case 'BOTTOM_LEFT':
        x0 += dx;
        break;
      case 'RIGHT':
      case 'TOP_RIGHT':
      case 'BOTTOM_RIGHT':
        x1 += dx;
        break;
    }
    
    switch (handle) {
      case 'TOP':
      case 'TOP_LEFT':
      case 'TOP_RIGHT':
        y0 += dy;
        break;
      case 'BOTTOM':
      case 'BOTTOM_LEFT':
      case 'BOTTOM_RIGHT':
        y1 += dy;
        break;
    }

    const oppositeCorner: Placement = 
      handle === 'TOP_LEFT' ? Placement.BOTTOM_RIGHT :
      handle === 'TOP_RIGHT' ? Placement.BOTTOM_LEFT :
      handle === 'BOTTOM_RIGHT' ? Placement.TOP_LEFT :
        Placement.TOP_RIGHT;

    const nextBounds = new Rect(x0, y0, x1 - x0, y1 - y0);

    // Mutate OSD image in place
    props.selected.osdImage.fitBounds(nextBounds, oppositeCorner, true);
    
    const updated: SelectedImage = {
      ...props.selected,
      x: nextBounds.x,
      y: nextBounds.y
    }

    updateImage(props.selected.id, updated);
  }

  const onPointerDown = (evt: React.PointerEvent) => {
    const target = evt.target as Element;
    target.setPointerCapture(evt.pointerId);

    const pt = viewport.pointFromPixel(new Point(evt.clientX, evt.clientY));
    setOrigin(pt);
  }

  const onPointerMove = (handle: HandleType) => (evt: React.PointerEvent) => {
    if (!origin) return;

    const { x, y } = viewport.pointFromPixel(new Point(evt.clientX, evt.clientY));
    const delta = [x - origin.x, y - origin.y];

    if (handle === 'SHAPE') {
      onMoveImage(delta); 
    } else { 
      onResizeImage(handle, delta);
    }
  }

  const onPointerUp = (evt: React.PointerEvent) => {
    const target = evt.target as Element;
    target.releasePointerCapture(evt.pointerId);
    
    setOrigin(undefined);
    setInitialBounds(props.selected.osdImage.getBounds());
  }

  return (
    <g>
      <polygon
        className="cursor-grab"
        points={cornersToSvgPoints(corners)}
        fill="transparent"
        stroke="white"
        strokeWidth={5}
        vectorEffect="non-scaling-stroke"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove('SHAPE')}
        onPointerUp={onPointerUp} />

      <polygon
        className="cursor-grab"
        points={cornersToSvgPoints(corners)}
        fill="transparent"
        stroke="oklch(70.5% 0.213 47.604)"
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
        strokeDasharray="5 2" 
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove('SHAPE')}
        onPointerUp={onPointerUp} />

      {corners.map((corner, i) => (
        <ToolCornerHandle 
          key={i} 
          direction={
            i === 0 ? 'NW' :
            i === 1 ? 'NE' :
            i === 2 ? 'SE' :
            'SW'
          }
          corner={corner} 
          type={HANDLE_TYPES[i]}
          viewer={props.viewer} 
          onPointerDown={onPointerDown} 
          onPointerMove={onPointerMove(HANDLE_TYPES[i])}
          onPointerUp={onPointerUp} />
      ))}
    </g>
  )

}