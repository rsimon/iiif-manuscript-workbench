import { Point, type TiledImage, type Viewer } from 'openseadragon';
import type { DraggableImage } from '../composer-types';

export const resolveId = (
  images: DraggableImage[],
  imageOrId?: TiledImage | string | null
): string | null => {
  if (!imageOrId) return null;
  if (typeof imageOrId === 'string') return imageOrId;

  const source = imageOrId.source as Record<string, any>;

  return images.find(img => {
    if (typeof img.tileSource === 'string') {
      // WARNING! Extremely brittle hack!
      const id = source['@id'] || source.id;
      return img.tileSource.startsWith(decodeURIComponent(id));
    } else {
      return Object.entries(img.tileSource).every(([key, value]) =>
        source.hasOwnProperty(key) && source[key] === value);
    }
  })?.id || null;
}

export const getImageAt = (viewer: Viewer, point: Point): TiledImage | undefined => {
  const worldPt = viewer.viewport.pointFromPixel(point);

  const count = viewer.world.getItemCount();

  let hits: OpenSeadragon.TiledImage[] = [];

  // OSD draws 0 to n - revert so that our array is z-index sorted
  for (let i = count; i > 0; i--) {
    const tiledImage = viewer.world.getItemAt(i - 1);

    const bounds = tiledImage.getBounds();
    if (!bounds.containsPoint(worldPt)) continue;

    const rotation = tiledImage.getRotation(true);
    if (rotation % 360 !== 0) {
      const imagePoint = tiledImage.viewportToImageCoordinates(worldPt);
      const { x: imageWidth, y: imageHeight } = tiledImage.getContentSize();
      if (
        imagePoint.x < 0 || imagePoint.x > imageWidth ||
        imagePoint.y < 0 || imagePoint.y > imageHeight
      ) continue;
    }

    hits.push(tiledImage);
  }

  return hits[0];
}

export const getImageCorners = (tiledImage: TiledImage) => {
  const bounds = tiledImage.getBounds();

  return [
    new Point(bounds.x, bounds.y),
    new Point(bounds.x + bounds.width, bounds.y),
    new Point(bounds.x + bounds.width, bounds.y + bounds.height),
    new Point(bounds.x, bounds.y + bounds.height),
  ];
}

export const cornersToSvgPoints = (corners: Point[]): string =>
  corners.map(p => `${p.x},${p.y}`).join(' ');