import { GalleryThumbnails, Library, Microscope, Puzzle, ScanEye, X } from 'lucide-react';
import { Button } from '@/shadcn/button';
import { DockviewReact, type DockviewReadyEvent, type IDockviewPanelHeaderProps, themeLight } from 'dockview-react';
import { 
  Composer,
  Inspector,
  Preview,
  Reconstruction,
  SourceBrowser
} from '@/panels';


import 'dockview-react/dist/styles/dockview.css';
import './workspace.css';

const TABS = {
  composer: { icon: <Puzzle className="size-4" />, title: 'Canvas Composer' },
  inspector: { icon: <Microscope className="size-4" />, title: "Inspector" },
  preview: { icon: <ScanEye className="size-4" />, title: "Preview" },
  reconstruction: { icon: <GalleryThumbnails className="size-4" />, title: 'Reconstruction' },
  source_browser: { icon: <Library className="size-4"/>, title: 'Source Materials' }
} 

const TabRenderer = (props: IDockviewPanelHeaderProps) => {
  // @ts-ignore
  const { icon, title } = TABS[props.api.id];

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-1.5 items-center font-medium">
        {icon} {title}
      </div>

      <Button 
        variant="ghost"
        size="icon-sm"
        className="size-7"
        onClick={() => props.api.close()}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

export const Workspace = () => {

  const onReady = (event: DockviewReadyEvent) => {
    event.api.addPanel({
      id: 'source_browser',
      component: 'source_browser',
    });

    event.api.addPanel({
      id: 'reconstruction',
      component: 'reconstruction',
      position: { referencePanel: 'source_browser', direction: 'right' },
      initialWidth: event.api.width * 0.8
    });

    event.api.addPanel({
      id: 'composer',
      component: 'composer',
      inactive: true
    });

    event.api.addPanel({
      id: 'inspector',
      component: 'inspector',
      position: { referencePanel: 'reconstruction', direction: 'right'},
      initialWidth: event.api.width * 0.2
    });

    event.api.addPanel({
      id: 'preview',
      component: 'preview',
      position: { referencePanel: 'inspector', direction: 'below'}
    });
  }

  return (
    <main className="flex-1 overflow-hidden p-2">
      <DockviewReact
        onReady={onReady}
        theme={{
          ...themeLight,
          gap: 6
        }}
        defaultTabComponent={TabRenderer}
        components={{
          composer: Composer,
          inspector: Inspector,
          preview: Preview,
          reconstruction: Reconstruction,
          source_browser: SourceBrowser,
        }}
      />
    </main>
  )

}