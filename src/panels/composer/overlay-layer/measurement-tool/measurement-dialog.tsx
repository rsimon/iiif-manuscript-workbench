import { useRef, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { RulerDimensionLine, X } from 'lucide-react';
import { useComposerState } from '../../composer-state';
import { useMeasurement } from './measurement-context';
import { Button } from '@/shadcn/button';
import { Input } from '@/shadcn/input';

interface MeasurementDialogProps {

  onClose(): void;

}

export const MeasurementDialog = (props: MeasurementDialogProps) => {

  const handleRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const { isDragging } = useDraggable(handleRef, { handle: handleRef });

  const canvasScale = useComposerState(state => state.canvasScale);
  const setCanvasScale = useComposerState(state => state.setCanvasScale);

  // Current state for the line drawing tool
  const { measurement, setMeasurement } = useMeasurement();
  
  const hasLine = measurement.phase === 'committed' || measurement.phase === 'dragging';
  const viewportDistance = hasLine ? Math.round(10000 * measurement.viewportDistance) / 10000 : 0;

  // Calibration field values
  const [physicalReferenceDistance, setPhysicalReferenceDistance] = useState('');
  const [unit, setUnit] = useState('');

  const physicalDistanceNum = parseFloat(physicalReferenceDistance);

  const canSetScale = hasLine 
    && viewportDistance > 0 
    && !isNaN(physicalDistanceNum) 
    && physicalDistanceNum > 0
    && unit.trim().length > 0;

  const onSetCanvasScale = () => {
    setCanvasScale({ 
      factor: viewportDistance / physicalDistanceNum,
      unit: unit
    });

    setMeasurement({ phase: 'idle' });
  }

  const onResetScale = () => {
    setPhysicalReferenceDistance('');
    setCanvasScale(undefined)
  }

  return (
    <div
      ref={handleRef}
      style={{ position: 'absolute', bottom: 80, left: -20, zIndex: 90 }}
      className={`
        w-72 rounded-xs border bg-popover text-popover-foreground shadow-lg
        ${isDragging ? 'cursor-grabbing select-none' : ''}`}>

      <div className="flex items-center justify-between p-1 pl-2 border-b bg-muted cursor-grab">
        <span className="text-[13px] font-medium flex gap-1.5 items-center">
          <RulerDimensionLine className="size-4" /> Tape Measure
        </span>

        <button
          onClick={props.onClose}
          className="rounded p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 text-sm space-y-4">
        {canvasScale ? (
          <div className="space-y-1">
            <p className="font-medium text-xs text-foreground">Distance</p>
            {hasLine ? (
              <p className="text-2xl font-semibold tracking-tight">
                {Math.ceil(1000 * measurement.viewportDistance! / canvasScale.factor) / 1000} <span className="text-base font-normal text-muted-foreground">{canvasScale.unit}</span>
              </p>
            ) : (
              <p className="text-muted-foreground text-xl">Draw line to measure</p>
            )}
            <p className="text-xs text-muted-foreground">Scale: 1 unit = {Math.round(10000 * canvasScale.factor) / 10000} {canvasScale.unit}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-medium text-foreground">No scale set</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Click two points over a known distance (such as a scale bar or ruler
              visible in the image) to calibrate measurements.
            </p>
          </div>
        )}

        {canvasScale ? (
          <div className="pt-2">
            <Button 
              className="w-full"
              variant="outline"
              onClick={onResetScale}>
              Reset Scale
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`space-y-3 ${!hasLine ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  readOnly
                  value={hasLine ? viewportDistance : ''}
                  className="w-20 rounded border bg-muted px-2 py-1 text-sm text-muted-foreground text-right" />

                <span className="text-muted-foreground"> 
                  = 
                </span>

                <Input
                  placeholder="e.g. 10"
                  value={physicalReferenceDistance} 
                  onChange={evt => setPhysicalReferenceDistance(evt.target.value)} />

                <Input
                  placeholder="unit"
                  value={unit}
                  onChange={evt => setUnit(evt.target.value)} />
              </div>

              <Button 
                disabled={!canSetScale}
                className="w-full"
                onClick={onSetCanvasScale}>
                Set Scale
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}