import { useState } from 'react';
import { Download, ImagePlus } from 'lucide-react';
import { Button } from '@/shadcn/button';
import { Separator } from '@/shadcn/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { IIIFIcon } from '@/components/iiif-icon';
import { ImportManifestDialog } from '@/dialogs/import-manifest';
import { ExportManifestDialog } from '@/dialogs/export-manifest';
import { useWorkspaceStore } from '@/store';

export const AppHeader = () => {

  const project = useWorkspaceStore(state => state.project);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b bg-white py-2 px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <IIIFIcon 
              color
              className="size-6 text-muted-foreground mb-px" />
            Manuscript Workbench
          </div>

          {project && (
            <div className="flex items-center gap-2">
              <span>·</span>
              <span className="text-sm font-bold text-foreground">
                Untitled Manifest
              </span>
            </div>
          )}
        </div>

        <div />
        
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger 
              render={
                <Button
                  variant="ghost"
                  onClick={() => setShowImportDialog(true)}
                  disabled={!project}>
                  <ImagePlus className="size-4.5" />
                </Button>
              } />
            <TooltipContent>
              Import manifest into workspace
            </TooltipContent>
          </Tooltip>

          <Separator 
            orientation="vertical" />
          
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => setShowExportDialog(true)}
                  disabled={!project || project.reconstruction.length === 0}
                  className="ml-2 gap-3 pr-3.5">
                  <Download className="size-4.5" />
                  Export
                </Button>
              } />
            <TooltipContent>Export workspace as IIIF manifest</TooltipContent>
          </Tooltip>
        </div>
      </header>
      
      <ImportManifestDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog} />

      <ExportManifestDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog} />
    </>
  )

}