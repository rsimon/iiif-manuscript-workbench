import { useState } from 'react';
import { ImportManifestDialog } from '@/dialogs/import-manifest';
import { ManifestTree } from './manifest-tree';

export const SourceBrowser = () => {

  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="flex h-full w-full flex-col">
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