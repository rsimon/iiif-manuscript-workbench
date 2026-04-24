import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { TiledImage } from 'openseadragon';
import type { DraggableImage } from '../../composer-types';
import { useComposerState } from '../../composer-state';
import { resolveId } from '../overlay-utils';

export interface HoveredImage extends DraggableImage {

  osdImage: TiledImage;

}

export const useHoverManager = (): [
  HoveredImage | null,
  Dispatch<SetStateAction<TiledImage | undefined>>
] => {
  // Original TiledImage
  const [source, setSource] = useState<TiledImage | undefined>();

  // Derivative DraggableImage
  const images = useComposerState(s => s.images);
  const setHoveredId = useComposerState(s => s.setHoveredId);

  const derivedSourceId = useMemo(() => {
    if (!source) return null;
    return resolveId(images, source);
  }, [source, images]);

  const hovered: HoveredImage | null = useMemo(() => {
    if (!source || !derivedSourceId) return null;
    const img = images.find(i => i.id === derivedSourceId);
    return img ? { ...img, osdImage: source } : null;
  }, [source, images, derivedSourceId]);

  useEffect(() => {
    setHoveredId(derivedSourceId);
  }, [derivedSourceId, setHoveredId]);

  return [hovered, setSource]
}