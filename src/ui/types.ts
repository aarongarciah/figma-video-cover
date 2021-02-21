export enum AlertType {
  INFO = 'info',
  ERROR = 'error',
  INFO_LOADING = 'info-loading',
}

export enum VideoType {
  NONE = '',
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
}

export enum VideoTypeBaseUrl {
  YOUTUBE = 'https://img.youtube.com/vi/',
  VIMEO = 'https://vimeo.com/api/v2/video/',
}

export enum YouTubeQualityFileName {
  MAX = 'maxresdefault.jpg',
  STANDARD = 'sddefault.jpg',
  HIGH = 'hqdefault.jpg',
  MEDIUM = 'mqdefault.jpg',
  DEFAULT = 'default.jpg',
}

export interface FormElements extends HTMLFormControlsCollection {
  videoUrl?: HTMLInputElement;
}
