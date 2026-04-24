import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { TiledImage } from 'openseadragon';
import { useComposerState } from '../../composer-state';
import type { DraggableImage } from '../../composer-types';
import { resolveId } from '../overlay-utils';

export interface SelectedImage extends DraggableImage {

  osdImage: TiledImage;

}

export const useSelectionManager = (): [
  SelectedImage | null,
  Dispatch<SetStateAction<TiledImage | undefined>>
] => {
  // Original TiledImage
  const [source, setSource] = useState<TiledImage | undefined>();

  // Derivative DraggableImage
  const images = useComposerState(s => s.images);
  const setSelectedId = useComposerState(s => s.setSelectedId);

  const derivedSourceId = useMemo(() => {
    if (!source) return null;
    return resolveId(images, source);
  }, [source, images]);

  const selected: SelectedImage | null = useMemo(() => {
    if (!source || !derivedSourceId) return null;
    const img = images.find(i => i.id === derivedSourceId);
    return img ? { ...img, osdImage: source } : null;
  }, [source, images, derivedSourceId]);

  useEffect(() => {
    setSelectedId(derivedSourceId);
  }, [derivedSourceId, setSelectedId]);

  return [selected, setSource];
  
}