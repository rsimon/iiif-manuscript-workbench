import { useEffect, useState } from 'react';
import { MouseTracker, Point } from 'openseadragon';
import type { MouseTrackerEvent, PointerMouseTrackerEvent, Viewer } from 'openseadragon';
import { useComposerState } from '../../composer-state';

interface MeasurementLayerProps {

  viewer: Viewer;

}

type MeasurePhase = 'idle' | 'dragging' | 'confirming';

interface MeasureState {

  phase: MeasurePhase;

  start: Point;

  end: Point;

}

const CLICK_THRESHOLD = 5; // pixels

const pixelDistance = (a: Point, b: Point) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const MeasurementLayer = (props: MeasurementLayerProps) => {
  const isMeasurementEnabled = useComposerState(state => state.isMeasurementEnabled);

  const [measure, setMeasure] = useState<MeasureState | undefined>();

  useEffect(() => {
    if (!isMeasurementEnabled) return;

    const { viewer } = props;

    viewer.setMouseNavEnabled(false);

    const tracker = new MouseTracker({
      element: viewer.canvas,

      pressHandler: (evt: PointerMouseTrackerEvent) => {
        const pt = viewer.viewport.pointFromPixel(evt.position);

        setMeasure(m => {
          if (!m || m.phase === 'idle') {
            // First click / start of drag
            return { phase: 'dragging', start: pt, end: pt };
          } else if (m) {
            // Second click while confirming → commit
            return { ...m, phase: 'idle' };
          }
        });
      },

      dragHandler: (evt: MouseTrackerEvent<Event>) => {
        // @ts-ignore
        const position: Point = evt.position;
        const pt = viewer.viewport.pointFromPixel(position);

        setMeasure(m => m && m.phase === 'dragging'
          ? { ...m, end: pt }
          : undefined
        );
      },

      moveHandler: (evt: MouseTrackerEvent<Event>) => {
        // @ts-ignore
        const position: Point = evt.position;
        const pt = viewer.viewport.pointFromPixel(position);

        setMeasure(m => m && m.phase === 'confirming'
          ? { ...m, end: pt }
          : m
        );
      },

      releaseHandler: (evt: MouseTrackerEvent<Event>) => {
        // @ts-ignore
        const position: Point = evt.position;

        setMeasure(m => {
          if (!m || m.phase !== 'dragging') return m;

          const startPx = viewer.viewport.pixelFromPoint(m.start);
          const wasDrag = pixelDistance(startPx, position) > CLICK_THRESHOLD;

          return wasDrag
            ? { ...m, phase: 'idle' }  
            : { ...m, phase: 'confirming' };
        });
      }
    });

    tracker.setTracking(true);

    return () => {
      tracker.destroy();
      viewer.setMouseNavEnabled(true);
      setMeasure(undefined);
    };
  }, [props.viewer, isMeasurementEnabled]);

  return (isMeasurementEnabled && measure) ? (
    <g pointerEvents="none">
      <line
        x1={measure.start.x} y1={measure.start.y}
        x2={measure.end.x}   y2={measure.end.y}
        stroke="oklch(70.5% 0.213 47.604)"
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke" />
    </g>
  ) : null;
};