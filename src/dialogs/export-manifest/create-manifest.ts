import type { Project } from '@/types';
import type { CozyCanvas } from 'cozy-iiif';
import { hydrateCanvas } from 'cozy-iiif/helpers';

export const createManifest = (
  id: string,
  project: Project, 
  label: string, 
  description: string, 
  attribution: string
) => ({
  '@context': 'http://iiif.io/api/presentation/3/context.json',
  type: 'Manifest',
  id: id,
  label: label,
  description,
  attribution,
  metadata: [
    {
      label: 'Created',
      value: new Date().toISOString(),
    },
    {
      label: 'Source Manifests',
      value: project.sources.map((s) => s.manifestUrl).join(', '),
    },
  ],
  items: project.reconstruction.map(sc => sc.canvas.source)
});

export const createEmptyCanvas = (
  id: string,
  width: number,
  height: number
): CozyCanvas => hydrateCanvas({
  id,
  width,
  height,
  images: [],
  source: {
    id,
    type: 'Canvas'
  }
} as unknown as CozyCanvas);