import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cozy, type CozyCanvas, type CozyManifest } from 'cozy-iiif';
import { hydrateCanvas } from 'cozy-iiif/helpers';
import type { Project, Selection, SourceManifest } from '@/types';

interface WorkspaceStore {
  
  project: Project | null;

  selection: Selection | null;

  composerActiveCanvasId?: string;

  /**
   * Actions: selection
   */
  setSelection: (selection: Selection | null) => void;

  /** 
   * Actions: source browser 
   */
  addSourceManifest: (url: string, manifest: CozyManifest) => void;  
  removeSourceManifest: (manifestId: string) => void;
  removeAllSourceManifests: () => void;
  toggleSourceManifestExpanded: (manifestId: string) => void;

  /**
   * Actions: reconstruction
   */
  addCanvasToReconstruction: (sourceManifestId: string, canvas: CozyCanvas) => void;
  removeCanvasFromReconstruction: (canvasId: string) => void;
  reorderReconstruction: (activeId: string, overId: string) => void;
  resetReconstruction: () => void;

  /**
   * Actions: canvas composer
   */
  openInComposer: (reconstructionCanvasId: string) => void;
  updateReconstructionCanvas: (reconstructionCanvasId: string, updated: CozyCanvas) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      
      project: { sources: [], reconstruction: [] },

      selection: null,

      isComposerOpen: false,

      setSelection: selection => set({ selection }),
      
      addSourceManifest: (manifestUrl, manifest) => {
        const { project } = get();
        if (!project) return;
        
        // Check if already added
        if (project.sources.some(s => s.manifestUrl === manifestUrl))
          return;
        
        const sourceManifest: SourceManifest = {
          id: crypto.randomUUID(),
          manifestUrl,
          manifest,
          expanded: true
        };
        
        set({
          project: {
            ...project,
            sources: [...project.sources, sourceManifest]
          }
        });
      },
      
      removeSourceManifest: manifestId => {
        const { project } = get();
        if (!project) return;
        
        set({
          project: {
            ...project,
            sources: project.sources.filter(s => s.id !== manifestId)
          }
        });
      },

      removeAllSourceManifests: () => {
        const { project } = get();
        if (!project) return;

        set({
          project: {
            ...project,
            sources: []
          }
        });
      },
      
      toggleSourceManifestExpanded: (manifestId) => {
        const { project } = get();
        if (!project) return;
        
        set({
          project: {
            ...project,
            sources: project.sources.map(s =>
              s.id === manifestId ? { ...s, expanded: !s.expanded } : s
            ),
          },
        });
      },

      addCanvasToReconstruction: (sourceManifestId, canvas) => {
        const { project } = get();
        if (!project) return;
        
        const reconstructionCanvas = {
          id: crypto.randomUUID(),
          sourceManifestId,
          canvas,
          order: project.reconstruction.length
        };
        
        set({
          project: {
            ...project,
            reconstruction: [...project.reconstruction, reconstructionCanvas]
          },
        });
      },

      removeCanvasFromReconstruction: (canvasId) => {
        const { project, selection } = get();
        if (!project) return;
        
        const newReconstruction = project.reconstruction
          .filter(c => c.id !== canvasId)
          .map((c, i) => ({ ...c, order: i }));
        
        set({
          project: {
            ...project,
            reconstruction: newReconstruction
          },
          selection: selection?.reconstructionCanvasId === canvasId ? null : selection,
        });
      },

      reorderReconstruction: (activeId, overId) => {
        const { project } = get();
        if (!project || activeId === overId) return;
        
        const oldIndex = project.reconstruction.findIndex(c => c.id === activeId);
        const newIndex = project.reconstruction.findIndex(c => c.id === overId);
        
        if (oldIndex === -1 || newIndex === -1) return;
        
        const newReconstruction = [...project.reconstruction];
        const [removed] = newReconstruction.splice(oldIndex, 1);
        newReconstruction.splice(newIndex, 0, removed);
        
        const reordered = newReconstruction.map((c, i) => ({ ...c, order: i }));
        
        set({
          project: {
            ...project,
            reconstruction: reordered
          },
        });
      },

      resetReconstruction: () => {
        const { project, selection } = get();
        if (!project) return;
        
        set({
          project: {
            ...project,
            reconstruction: []
          },
          selection: selection?.reconstructionCanvasId ? null : selection,
        });
      },

      openInComposer: id => set({ composerActiveCanvasId: id }),

      updateReconstructionCanvas: (id, updated) => {
        const { project } = get();
        if (!project) return;

        const next = project.reconstruction.map(rc => rc.id === id 
          ? { ...rc, canvas: { ...updated, id }}
          : rc)

        set({ 
          project: {
            ...project,
            reconstruction: next
          }
        });
      }

    }),{
      name: 'manuscript-workbench-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        project: {
          ...state.project,
          sources: state.project?.sources.map(source => {
            const { manifest, ...rest } = source;
            // Serialize CozyManifest
            return { manifest: manifest.source, ...rest };
          })
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.project) return;

        // Re-hydrate source canvases
        state.project.sources = state.project.sources.map(source => ({
          ...source,
          manifest: (Cozy.parse(source.manifest) as any).resource
        }));

        // Re-hydrate reconstruction canvases
        state.project.reconstruction = state.project.reconstruction.map(rc => ({
          ...rc,
          canvas: hydrateCanvas(rc.canvas)
        }));
      }
    }
  )
);
