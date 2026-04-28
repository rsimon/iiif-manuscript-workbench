import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shadcn/button';
import { ScrollArea } from '@/shadcn/scroll-area';
import { Separator } from '@/shadcn/separator';
import { useWorkspaceStore } from '@/store';
import { MetadataField } from '../metadata-field';
import { useComposerState } from '@/panels/composer';

interface SourceCanvasInspectorProps {

  canvasId: string;

  manifestId: string;

}

export const SourceCanvasInspector = (props: SourceCanvasInspectorProps) => {
  const project = useWorkspaceStore(state => state.project);
  const isComposerOpen = useWorkspaceStore(state => Boolean(state.composerActiveCanvasId));
  const addCanvasToReconstruction = useWorkspaceStore(state => state.addCanvasToReconstruction);

  const addCanvas = useComposerState(state => state.addCanvas);
  
  const { canvas, manifest } = useMemo(() => {
    if (!project) return { canvas: undefined, manifest: undefined };

    const source = project.sources.find(s => s.id === props.manifestId);
    if (!source) return { canvas: undefined, manifest: undefined };

    const canvas = source.manifest.canvases.find(c => c.id === props.canvasId);
    return { canvas, manifest: source.manifest };
  }, [props.canvasId, props.manifestId, project]);

  return (canvas && manifest) ? (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-snug">{canvas.getLabel()}</h3>
            <p className="text-xs text-muted-foreground">
              {manifest.getLabel()}
            </p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-3">
            <MetadataField 
              label="Width" value={`${canvas.width.toLocaleString()} px`} />

            <MetadataField 
              label="Height" value={`${canvas.height.toLocaleString()} px`} />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => addCanvasToReconstruction(manifest.id, canvas)}>
              <Plus className="size-4" />
              Add to Reconstruction
            </Button>

            {isComposerOpen && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => addCanvas(canvas)}>
                <Plus className="size-4" />
                Add to Composer
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-1 overflow-hidden">
            <div className="text-xs font-medium text-muted-foreground">
              Canvas ID
            </div>
            <p className="text-xs text-foreground truncate font-mono break-all">
              {canvas.id}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  ) : null;

}