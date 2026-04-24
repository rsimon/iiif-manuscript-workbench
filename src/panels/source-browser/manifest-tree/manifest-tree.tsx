import { Library } from 'lucide-react';
import { useWorkspaceStore } from '@/store';
import { Button } from '@/shadcn/button';
import { ScrollArea } from '@/shadcn/scroll-area';
import { ManifestTreeItem } from './manifest-tree-item';

interface ManifestTreeProps {

  onImport(): void;

}

export const ManifestTree = (props: ManifestTreeProps) => {
  const {
    project,
    selection,
    setSelection,
    toggleSourceManifestExpanded,
    removeSourceManifest,
    addCanvasToReconstruction
  } = useWorkspaceStore();

  if (!project) return null;

  return (
    <ScrollArea className="flex-1 h-full bg-white">
      {project.sources.length === 0 ? (
        <div className="flex h-full flex-col gap-8 items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center">
            <Library 
              className="mb-2 h-8 w-8 text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              No source manifests
            </p>
          </div>

          <Button
            onClick={() => props.onImport()}>
            Import from URL
          </Button>
        </div>
      ) : (
        <div className="py-2 pl-1 pr-4">
          {project.sources.map(source => (
            <ManifestTreeItem
              key={source.id}
              source={source}
              isSelected={selection?.type === 'manifest' && selection.manifestId === source.id}
              selectedCanvasId={selection?.type === 'source_canvas' ? selection.sourceCanvasId : undefined}
              onSelectManifest={() =>
                setSelection({ type: 'manifest', manifestId: source.id })
              }
              onSelectCanvas={(canvasId) =>
                setSelection({ type: 'source_canvas', manifestId: source.id, sourceCanvasId: canvasId })
              }
              onToggleExpanded={() => toggleSourceManifestExpanded(source.id)}
              onRemove={() => removeSourceManifest(source.id)}
              onAddToReconstruction={canvas =>
                addCanvasToReconstruction(source.id, canvas)
              }
            />
          ))}
        </div>
      )}
    </ScrollArea>
  )

}