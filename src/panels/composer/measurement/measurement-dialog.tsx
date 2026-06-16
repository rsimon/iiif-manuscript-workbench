import { useRef } from 'react';
import { useDraggable } from '@neodrag/react';
import { X } from 'lucide-react';

interface MeasurementDialogProps {

  onClose(): void;

}

export const MeasurementDialog = (props: MeasurementDialogProps) => {
  const handleRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const { isDragging } = useDraggable(handleRef, {
    handle: handleRef,
  });

  return (
    <div
      ref={handleRef}
      style={{ position: 'absolute', bottom: 80, left: -20, zIndex: 50 }}
      className={`
        w-72 rounded-xs border bg-popover text-popover-foreground shadow-lg
        ${isDragging ? 'cursor-grabbing select-none' : ''}`}>
      <div className="flex items-center justify-between p-1 pl-2 border-b bg-muted cursor-grab">
        <span className="text-[13px] font-medium">Measurement</span>
        <button
          onClick={props.onClose}
          className="rounded p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 text-sm">
        Hello World
      </div>
    </div>
  )

}