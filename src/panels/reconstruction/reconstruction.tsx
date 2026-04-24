import { useCallback, useMemo, useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { useWorkspaceStore } from '@/store';
import { ScrollArea, ScrollBar } from '@/shadcn/scroll-area';
import { CanvasCard, SortableCanvasCard } from './canvas-card';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';

export const Reconstruction = () => {
  const { 
    project, 
    reorderReconstruction, 
    selection,
    setSelection,
    addCanvasToReconstruction,
    removeCanvasFromReconstruction
  } = useWorkspaceStore();

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const draggedCanvas = useMemo(() => { 
    if (!project || !draggedId) return;

    return project.reconstruction.find(rc => rc.id === draggedId);
  }, [draggedId, project]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (evt: DragStartEvent) =>
    setDraggedId(evt.active.id as string);

  const onDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    setDraggedId(null);
    
    if (over && active.id !== over.id)
      reorderReconstruction(active.id as string, over.id as string);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/x-iiif-canvas');
    if (!data || !project) return;
    
    try {
      const { type, canvasId } = JSON.parse(data);

      if (type === 'source-canvas') {
        for (const source of project.sources) {
          const canvas = source.manifest.canvases.find(c => c.id === canvasId);
          if (canvas) {
            addCanvasToReconstruction(source.id, canvas);
            break;
          }
        }
      }
    } catch {
      // Invalid data
    }
  }, [addCanvasToReconstruction]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  return project ? (
    <div className="flex h-full w-full flex-col">
      <div
        className="flex-1 overflow-hidden relative"
        onDrop={onDrop}
        onDragOver={onDragOver}>
        {project.reconstruction.length === 0 ? (
          <div className="flex h-full flex-col gap-3 items-center justify-center p-4">
            <div className="rounded-lg border-2 border-dashed p-6">
              <Layers className="mx-auto size-8 text-neutral-300" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-center text-sm text-muted-foreground/65">
                Add canvases from the Source Browser
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}>
              <SortableContext
                items={project.reconstruction.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}>
                <div className="flex gap-2 p-4 flex-wrap">
                  {project.reconstruction.map((canvas, index) => (
                    <SortableCanvasCard
                      key={canvas.id}
                      rc={canvas}
                      index={index}
                      isSelected={
                        selection?.type === 'reconstruction_canvas' &&
                        selection.reconstructionCanvasId === canvas.id
                      }
                      onSelect={() =>
                        setSelection({
                          type: 'reconstruction_canvas',
                          reconstructionCanvasId: canvas.id,
                        })
                      }
                      onRemove={() => removeCanvasFromReconstruction(canvas.id)}
                    />
                  ))}
                  
                  <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded border-2 border-dashed border-panel-border text-neutral-400/60 transition-colors hover:border-primary/50 hover:text-primary/50">
                    <Plus className="h-5 w-5" />
                  </div>
                </div>
              </SortableContext>
              
              <DragOverlay>
                {draggedCanvas ? (
                  <CanvasCard
                    rc={draggedCanvas}
                    index={project.reconstruction.findIndex(
                      c => c.id === draggedId
                    )}
                    isSelected={false}
                    isDragging
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  ) : null;

}