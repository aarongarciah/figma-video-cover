import { ActionTypes } from '../types';

figma.showUI(__html__, { width: 350, height: 180 });

async function createImage({ urls, videoId }: { urls: string[]; videoId: string }): Promise<void> {
  try {
    let fillHash = null;

    for (const url of urls) {
      try {
        const image = await figma.createImageAsync(url);
        fillHash = image?.hash;

        if (fillHash) {
          break;
        }
      } catch (error) {}
    }

    if (!fillHash) {
      throw new Error("Couldn't get the video cover image. Is the video URL correct?");
    }

    const fill: ImagePaint = {
      type: 'IMAGE',
      imageHash: fillHash,
      scaleMode: 'FILL',
    };

    const nodes = figma.currentPage.selection;

    // Fill all selected nodes with the image
    if (Array.isArray(nodes) && nodes.length > 0) {
      nodes.forEach((node) => {
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
  } catch (error) {
    console.error(error);
    figma.notify(error instanceof Error ? error.message : 'Something went wrong');
  }

  figma.closePlugin();
}

figma.ui.onmessage = async ({ action, payload }): Promise<void> => {
  switch (action) {
    case ActionTypes.CREATE_IMAGE:
      await createImage(payload);
    case ActionTypes.NOTIFY:
      figma.notify(payload.message || '');
    case ActionTypes.CLOSE:
      figma.closePlugin();
  }
};
