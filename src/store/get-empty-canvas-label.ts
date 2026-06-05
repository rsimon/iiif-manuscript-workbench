import type { Project } from '@/types';

export const getEmptyCanvasLabel = (project: Project) => {
  const regex = /^New Canvas( \((\d+)\))?$/;

  const numbers = project.reconstruction
    .map(rc => rc.canvas.getLabel().match(regex))
    .filter(Boolean)
    .map(match => (match![2] ? parseInt(match![2]) : 0));

  if (numbers.length === 0) return 'New Canvas';

  const max = Math.max(...numbers);
  return max === 0 ? 'New Canvas (1)' : `New Canvas (${max + 1})`;
}