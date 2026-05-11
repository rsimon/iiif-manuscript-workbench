import { useState } from 'react';
import { ListChevronsDownUp, ListChevronsUpDown, PlusSquare, Trash2 } from 'lucide-react';
import { PanelActionButton } from '@/components/panel-action-button';
import { ImportManifestDialog } from '@/dialogs/import-manifest';
import { ManifestTree } from './manifest-tree';
import { useWorkspaceStore } from '@/store';

export const SourceBrowser = () => {
  const sources = useWorkspaceStore(state => (state.project?.sources || []).length);
  const removeAllSourceManifests = useWorkspaceStore(state => state.removeAllSourceManifests);
  const expandAll = useWorkspaceStore(state => state.expandAllManifests);
  const collapseAll = useWorkspaceStore(state => state.collapseAllManifests);

  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 border-b p-0.5 flex justify-end">
        <PanelActionButton
          disabled={sources === 0}
          tooltip="Collapse all"
          onClick={collapseAll}>
          <ListChevronsDownUp />
        </PanelActionButton>

        <PanelActionButton
          disabled={sources === 0}
          tooltip="Expand all"
          onClick={expandAll}>
          <ListChevronsUpDown />
        </PanelActionButton>

        <PanelActionButton
          tooltip="Import IIIF presentation manifest"
          onClick={() => setShowImportDialog(true)}>
          <PlusSquare />
        </PanelActionButton>

        <PanelActionButton
          tooltip="Clear all sources"
          onClick={removeAllSourceManifests}>
          <Trash2 />
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