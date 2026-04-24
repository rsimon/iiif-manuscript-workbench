import type { Viewer } from 'openseadragon';
import type { DraggableImage } from './composer-types';

interface CanvasWorld {

  width: number;

  height: number;

  images: CanvasWorldImage[];

}

interface CanvasWorldImage {

  id: string;

  source: DraggableImage;

  width: number; 

  height: number;

  on?: [number, number, number, number];

}

export const createCanvasWorld = (viewer: Viewer, images: DraggableImage[], canvasWidth: number, canvasHeight: number): CanvasWorld => {
  const itemCount = viewer.world.getItemCount();

  const items = Array(itemCount).fill(null).map((_, i) => {
    const osdImage = viewer.world.getItemAt(i);

    const { dimensions, url } = osdImage.source;

    const id = url || (osdImage.source as any).id || (osdImage.source as any)['@id'];
    const width = dimensions.x;
    const height = dimensions.y;

    return { id, width, height, image: osdImage, source: images[i] };
  });

  const worldImages: CanvasWorldImage[] = items.map(item => {
    const { x, y, width, height } = item.image.getBounds();

    const image = {
      id: item.id.startsWith('/') ? `http://localhost:4321${item.id}` : item.id,
      width: item.width,
      height: item.height,
      source: item.source
    };

    if (x === 0 && y === 0 && item.width === canvasWidth && item.height === canvasHeight) {
      return image;
    } else {
      const on = [x, y, width, height].map(n => Math.round(n * canvasWidth)) as [number, number, number, number];
      return {...image, on };
    }
  });

  const world = {
    width: canvasWidth,
    height: canvasHeight,
    images: worldImages
  };

  return world;
}