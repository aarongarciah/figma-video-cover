import { ActionTypes } from '../types';

figma.showUI(__html__, { width: 350, height: 180 });

function createImage({ imageBytes, videoId }: { imageBytes: Uint8Array; videoId: string }): void {
  const image = figma.createImage(imageBytes);
  const imageHash = image.hash;
  const fill: ImagePaint = {
    type: 'IMAGE',
    imageHash: imageHash,
    scaleMode: 'FILL',
  };
  const nodes = figma.currentPage.selection;

  // Fill all selected nodes with the image
  if (Array.isArray(nodes) && nodes.length > 0) {
    nodes.forEach(node => {
      if (!Array.isArray(node.fills)) {
        return;
      }

      node.fills = [...node.fills, fill];
    });
  }
  // Create a rectangle filled with the image
  else {
    const rect = figma.createRectangle();

    // 16:9 aspect ratio
    const width = 480;
    const height = 270;

    rect.resize(width, height);
    rect.x = figma.viewport.center.x - Math.round(width / 2);
    rect.y = figma.viewport.center.y - Math.round(height / 2);
    rect.name = `Video cover ${videoId}`;
    rect.fills = [fill];

    figma.currentPage.appendChild(rect);
    figma.currentPage.selection = [rect];
    figma.viewport.scrollAndZoomIntoView([rect]);
  }

  figma.closePlugin();
}

figma.ui.onmessage = ({ action, payload }): void => {
  switch (action) {
    case ActionTypes.CREATE_IMAGE:
      createImage(payload);
    case ActionTypes.NOTIFY:
      figma.notify(payload.message || '');
    case ActionTypes.CLOSE:
      figma.closePlugin();
  }
};
