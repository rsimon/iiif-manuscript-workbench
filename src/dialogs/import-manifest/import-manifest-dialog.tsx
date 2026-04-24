import { useState } from 'react';
import { AlertCircle, ImagePlus, Loader2 } from 'lucide-react';
import { Cozy } from 'cozy-iiif';
import { Alert, AlertDescription } from '@/shadcn/alert';
import { Button } from '@/shadcn/button';
import { Input } from '@/shadcn/input';
import { Label } from '@/shadcn/label';
import { useWorkspaceStore } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/dialog';

interface ImportManifestDialogProps {

  open: boolean;

  onOpenChange: (open: boolean) => void;

}

export const ImportManifestDialog = (props: ImportManifestDialogProps) => {

  const project = useWorkspaceStore(state => state.project);
  const addSourceManifest = useWorkspaceStore(state => state.addSourceManifest);

  const [url, setUrl] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  
  const onImport = async () => {
    if (!url.trim()) {
      setError('Please enter a manifest URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await Cozy.parseURL(url);

      if (result.type !== 'manifest') {
        console.error(result);
        throw new Error('Invalid IIIF presentation manifest');
      }
      
      addSourceManifest(url, result.resource);
      
      setUrl('');
      setError(null);
      props.onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import manifest');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Dialog 
      open={props.open} 
      onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg p-4">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 font-bold">
            <ImagePlus className="size-4" strokeWidth={2.25} />
            Import IIIF Manifest
          </DialogTitle>

          <DialogDescription>
            Enter the URL of a IIIF Presentation API 2.1 manifest to import it as
            a source for your reconstruction.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="manifest-url">Manifest URL</Label>
            <Input
              id="manifest-url"
              placeholder="https://example.org/iiif/manifest.json"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading)
                  onImport();
              }}
              disabled={loading}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!project && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please create a project first before importing manifests.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={loading}>
            Cancel
          </Button>
          
          <Button onClick={onImport} disabled={loading || !project}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}