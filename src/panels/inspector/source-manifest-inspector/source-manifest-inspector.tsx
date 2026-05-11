import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/shadcn/scroll-area';
import { Separator } from '@/shadcn/separator';
import { useWorkspaceStore } from '@/store';
import { MetadataField } from '../metadata-field';
import { MetadataItem } from '../metadata-item';

interface SourceManifestInspectorProps {

  manifestId: string;

}

export const  SourceManifestInspector = (props: SourceManifestInspectorProps) => {
  const project = useWorkspaceStore(state => state.project);

  const source = useMemo(() => {
    if (!project) return;
    return project.sources.find((s) => s.id === props.manifestId);
  }, [project, props.manifestId]);

  if (!source) return;

  const { manifest } = source;
  const canvasCount = source.manifest.canvases.length;
  
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium leading-snug">{manifest.getLabel()}</h3>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-3">
            <MetadataField label="Canvases" value={String(canvasCount)} />
          </div>
          
          {manifest.getMetadata().length > 0 && (
            <>
              <Separator />

              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Metadata
                </h4>
                {manifest.getMetadata().map((item, index) => (
                  <MetadataItem key={index} item={item} />
                ))}
              </div>
            </>
          )}
          
          <Separator />

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Source URL
            </span>
            <a
              href={source.manifestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline break-all
                whitespace-nowrap overflow-hidden">
              <ExternalLink className="size-3 shrink-0" />
              <span className="truncate">{source.manifestUrl}</span>
            </a>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}