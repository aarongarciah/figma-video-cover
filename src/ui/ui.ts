import { ActionTypes } from '../types';

import {
  AlertType,
  VideoType,
  VideoTypeBaseUrl,
  YouTubeQualityFileName,
  FormElements,
} from './types';

import './ui.css';

const $form = document.querySelector('#form');
const $videoUrl = document.querySelector('#videoUrl') as HTMLInputElement;
const $alert = document.querySelector('#alert');
const $alertMsg = document.querySelector('#alert-msg');

const alertErrorClass = 'alert--error';
const alertLoadingClass = 'alert--loading';

function postMessage(action: ActionTypes, payload?: unknown): void {
  parent.postMessage({ pluginMessage: { action, payload } }, '*');
}

// Credits: https://github.com/deponeWD/video/blob/master/script.js
function parseURL(url: string): { type: VideoType; id: string } {
  // - Supported YouTube URL formats:
  //   - http://www.youtube.com/watch?v=My2FRPA3Gf8
  //   - http://youtu.be/My2FRPA3Gf8
  //   - https://youtube.googleapis.com/v/My2FRPA3Gf8
  //   - https://m.youtube.com/watch?v=My2FRPA3Gf8
  // - Supported Vimeo URL formats:
  //   - http://vimeo.com/25451551
  //   - http://player.vimeo.com/video/25451551
  // - Also supports relative URLs:
  //   - //player.vimeo.com/video/25451551

  url.match(
    /(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/,
  );

  let type = VideoType.NONE;

  if (RegExp.$3.indexOf('youtu') > -1) {
    type = VideoType.YOUTUBE;
  } else if (RegExp.$3.indexOf('vimeo') > -1) {
    type = VideoType.VIMEO;
  }

  return {
    type,
    id: RegExp.$6,
  };
}

function getYoutubeThumbnailUrls(videoId: string): string[] {
  const baseUrl = `${VideoTypeBaseUrl.YOUTUBE}${videoId}/`;

  return Object.values(YouTubeQualityFileName).map((value) => `${baseUrl}${value}`);
}

async function getVimeoThumbnailUrls(videoId: string): Promise<string[]> {
  const url = `${VideoTypeBaseUrl.VIMEO}${videoId}.json`;
  const response = await fetch(url);

  if (!response || response.status !== 200) {
    throw new Error("Couldn't get the video cover image. Is the video URL correct?");
  }

  const urls: string[] = [];
  const json = await response.json();

  if (!json || !json[0]) {
    return [];
  }

  const firstResult = json[0];

  ['thumbnail_large', 'thumbnail_medium', 'thumbnail_small'].forEach((key) => {
    if (firstResult[key]) {
      urls.push(firstResult[key]);
    }
  });

  return urls;
}

function showAlert(msg: string, variant: AlertType = AlertType.INFO): void {
  if (!$alert || !$alertMsg) {
    return;
  }

  $alertMsg.innerHTML = msg;

  if (variant === AlertType.ERROR) {
    $alert.classList.add(alertErrorClass);
  } else {
    $alert.classList.remove(alertErrorClass);
  }

  if (variant === AlertType.INFO_LOADING) {
    $alert.classList.add(alertLoadingClass);
  } else {
    $alert.classList.remove(alertLoadingClass);
  }

  $alert.classList.remove('hidden');
}

async function getThumbnailUrls(videoType: VideoType, videoId: string): Promise<string[]> {
  switch (videoType) {
    case VideoType.YOUTUBE:
      return getYoutubeThumbnailUrls(videoId);
    case VideoType.VIMEO:
      showAlert('Loading', AlertType.INFO_LOADING);
      return await getVimeoThumbnailUrls(videoId);
    default:
      return [];
  }
}

function setupListeners(): void {
  if (!$form) {
    console.error('<form> element not found, closing the plugin');
    postMessage(ActionTypes.NOTIFY, { message: 'Video Cover plugin: Something went wrong' });
    postMessage(ActionTypes.CLOSE);
    return;
  }

  $form.addEventListener('submit', async function (e) {
    try {
      e.preventDefault();

      const $form = e.target as HTMLFormElement;
      const elements: FormElements = $form.elements;
      const videoUrl = elements.videoUrl ? elements.videoUrl.value.trim() : '';
      $videoUrl.value = videoUrl;

      if (videoUrl === '') {
        $videoUrl.focus();
        return false;
      }

      showAlert('Loading image', AlertType.INFO_LOADING);

      const { type: videoType, id: videoId } = parseURL(videoUrl);

      if (!videoId) {
        throw new Error(
          "Couldn't extract the video cover from the URL provided. Is the URL correct?",
        );
      }

      const thumbnailUrls = await getThumbnailUrls(videoType, videoId);

      if (!thumbnailUrls || (Array.isArray(thumbnailUrls) && thumbnailUrls.length === 0)) {
        throw new Error('Malformed video URL. Only YouTube and Vimeo urls are supported.');
      }

      postMessage(ActionTypes.CREATE_IMAGE, { urls: thumbnailUrls, videoId });
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Something went wrong', AlertType.ERROR);
    }

    return false;
  });

  window.addEventListener('keydown', function (e: KeyboardEvent) {
    try {
      const target = e.target as Element;

      // Close the plugin if pressing Esc key when
      // the input is not focused
      if (
        e.code.toString().toLowerCase() === 'escape' &&
        target.tagName.toLowerCase() !== 'input'
      ) {
        postMessage(ActionTypes.CLOSE);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

setupListeners();
