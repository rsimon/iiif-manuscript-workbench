import { useComposerState } from '../../composer-state';

export const CanvasIndicatorBackground = () => {
  const canvasWidth = useComposerState(state => state.canvasWidth);
  const canvasHeight = useComposerState(state => state.canvasHeight);

  const aspectRatio = canvasHeight / canvasWidth;

  return isNaN(aspectRatio) ? null : (
    <rect
      x={0}
      y={0}
      width={1}
      height={aspectRatio}
      fill="#fff"
      fillOpacity={0.9}
      filter="url(#shadow)"
      strokeWidth={0}
      pointerEvents="none" />
  )

}

export const CanvasIndicatorForeground = () => {
  const canvasWidth = useComposerState(state => state.canvasWidth);
  const canvasHeight = useComposerState(state => state.canvasHeight);

  const aspectRatio = canvasHeight / canvasWidth;

  return isNaN(aspectRatio) ? null : (
    <rect
      x={0}
      y={0}
      width={1}
      height={aspectRatio}
      fill="transparent"
      stroke="oklch(55.6% 0 0)" // neutral-500
      strokeWidth={1}
      strokeOpacity={1}
      vectorEffect="non-scaling-stroke"
      pointerEvents="none" />
  )

}