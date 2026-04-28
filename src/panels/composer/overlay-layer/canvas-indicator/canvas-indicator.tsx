import { useComposerState } from '../../composer-state';

export const CanvasIndicator = () => {
  const canvasWidth = useComposerState(state => state.canvasWidth);
  const canvasHeight = useComposerState(state => state.canvasHeight);

  const aspectRatio = canvasHeight / canvasWidth;

  return (
    <rect
      x={0}
      y={0}
      width={1}
      height={aspectRatio}
      fill="#fff"
      fillOpacity={0.9}
      stroke="oklch(0.39 0.18 349.32)"
      strokeWidth={1.5}
      strokeOpacity={0.25}
      vectorEffect="non-scaling-stroke"
      pointerEvents="none" />
  )

}