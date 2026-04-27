import { Microscope } from 'lucide-react';
import { useWorkspaceStore } from '@/store';
import { SourceCanvasInspector } from './source-canvas-inspector';

export const Inspector = () => {
  const project = useWorkspaceStore(state => state.project);
  const selection = useWorkspaceStore(state => state.selection);

  if (!project) return;

  const isSourceCanvasSelection: boolean = 
    !!(selection?.sourceCanvasId && selection.manifestId && selection.type === 'source_canvas');

  return (
    <div className="flex h-full w-full flex-col">
      {isSourceCanvasSelection ? (
        <div className="flex-1 overflow-auto">
          <SourceCanvasInspector 
            canvasId={selection!.sourceCanvasId!} 
            manifestId={selection!.manifestId!} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center flex flex-col gap-3">
            <Microscope className="mx-auto size-8 text-neutral-300" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground/65">
              Select an item to view details
            </p>
          </div>
        </div>
      )}
    </div>
  )

}