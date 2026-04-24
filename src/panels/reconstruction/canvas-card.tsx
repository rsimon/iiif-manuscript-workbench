import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Layers2, X } from 'lucide-react';
import { cn } from '@/shadcn/utils';
import { useWorkspaceStore } from '@/store';
import type { ReconstructionCanvas } from '@/types';

interface CanvasCardProps extends SortableCanvasCardProps {

  isDragging?: boolean;

}

interface SortableCanvasCardProps {

  rc: ReconstructionCanvas;

  index: number;

  isSelected: boolean;

  onSelect?(): void;

  onRemove?(): void;

}

export const CanvasCard = (props: CanvasCardProps) => {

  const { canvas } = props.rc;

  const openInComposer = useWorkspaceStore(state => state.openInComposer);

  return (
    <div
      className="group flex flex-col gap-1 relative"
      onClick={props.onSelect}
      onDoubleClick={() => openInComposer(props.rc.id)}>
      {props.onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            props.onRemove?.();
          }}
          className="absolute cursor-pointer right-1 top-1 border border-white z-10 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <X className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </button>
      )}
      
      <div className={cn(
        'relative h-24 w-20 shrink-0 cursor-pointer rounded border transition-all',
        props.isSelected
          ? 'border-primary ring-2 ring-offset-2 ring-primary'
          : 'border-panel-border hover:border-primary/50',
        props.isDragging && 'opacity-50')}>
        {canvas.images.length !== 1 ? (
          <div className="flex size-full items-center justify-center">
            <Layers2 className="size-5 text-neutral-400/60" />
          </div>
        ) :(
          <img
            src={canvas.getThumbnailURL(200)}
            alt={canvas.getLabel()}
            className="h-full w-full object-cover"
            loading="lazy" />
        )}
        
        <div className="absolute bottom-1 left-1 flex h-4 min-w-4 items-center justify-center rounded-xs bg-background/80 px-1 text-[10px] font-medium">
          {props.index + 1}
        </div>
      </div>

      <div className="bg-panel-header px-1 py-0.5">
        <p className="truncate text-[10px] text-muted-foreground">
          {canvas.getLabel() || `Canvas ${props.index + 1}`}
        </p>
      </div>
    </div>
  )
  
}

export const SortableCanvasCard = (props: SortableCanvasCardProps) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.rc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CanvasCard
        {...props}
        isDragging={isDragging} />
    </div>
  )

}