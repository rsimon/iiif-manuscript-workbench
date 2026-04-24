import { useEffect } from 'react';
import type { CanvasClickEvent, Viewer } from 'openseadragon';
import { getImageAt } from '../overlay-utils';
import { useSelectionManager } from './use-selection-manager';
import { ToolWidget } from './tool-widget';

interface ToolLayerProps {

  viewer: Viewer;

}

export const ToolLayer = (props: ToolLayerProps) => {
  const { viewer } = props;

  const [selected, setSelected] = useSelectionManager();

  useEffect(() => {
    const onCanvasClick = (event: CanvasClickEvent) => {
      const hit = getImageAt(viewer, event.position);
      setSelected(hit);
    }

    viewer.addHandler('canvas-click', onCanvasClick);

    return () => {
      viewer.removeHandler('canvas-click', onCanvasClick);
    };
  }, [viewer]);

  useEffect(() => {
    if (selected) {
      // viewer.setMouseNavEnabled()
    }
  }, [viewer, selected]);

  return selected ? (
    <ToolWidget 
      selected={selected} 
      viewer={viewer} />
  ) : null;

}