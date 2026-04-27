import { useState } from 'react';
import { PlusSquare, Trash2 } from 'lucide-react';
import { PanelActionButton } from '@/components/panel-action-button';
import { ImportManifestDialog } from '@/dialogs/import-manifest';
import { ManifestTree } from './manifest-tree';
import { useWorkspaceStore } from '@/store';

export const SourceBrowser = () => {
  const removeAllSourceManifests = useWorkspaceStore(state => state.removeAllSourceManifests);

  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 border-b p-0.5 flex justify-end">
        <PanelActionButton
          tooltip="Import IIIF presentation manifest"
          onClick={() => setShowImportDialog(true)}>
          <PlusSquare className="siz-4" />
        </PanelActionButton>

        <PanelActionButton
          tooltip="Clear all sources"
          onClick={removeAllSourceManifests}>
          <Trash2 className="siz-4" />
        </PanelActionButton>
      </div>

      <div className="flex-1 overflow-auto">
        <ManifestTree 
          onImport={() => setShowImportDialog(true)} />

        <ImportManifestDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog} />
      </div>
    </div>
  )

}