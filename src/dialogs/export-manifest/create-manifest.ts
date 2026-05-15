import type { Project } from '@/types';
import type { CozyCanvas } from 'cozy-iiif';
import { hydrateCanvas } from 'cozy-iiif/helpers';

export const createManifest = (
  id: string,
  project: Project, 
  label: string, 
  summary: string, 
  attribution: string
) => ({
  '@context': 'http://iiif.io/api/presentation/3/context.json',
  type: 'Manifest',
  id: id,
  label: {
    en: [label]
  },
  summary: {
    en: [summary]
  },
  requiredStatement: {
    label: { en: [ 'Attribution' ]},
    value: { en: [ attribution ]}
  },
  metadata: [
    {
      label: { en: ['Created' ]},
      value: { en: [ new Date().toISOString() ]},
    },
    {
      label: { en: ['Source Manifests']},
      value: { en: [project.sources.map((s) => s.manifestUrl).join(', ')]},
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