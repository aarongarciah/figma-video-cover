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
  YOUTUBE = 'https://cors-anywhere.herokuapp.com/https://img.youtube.com/vi/',
  VIMEO = 'https://vimeo.com/api/v2/video/',
}

export enum YouTubeQualityFileName {
  DEFAULT = 'default.jpg',
  STANDARD = 'sddefault.jpg',
  MEDIUM = 'mqdefault.jpg',
  HIGH = 'hqdefault.jpg',
  MAX = 'maxresdefault.jpg',
}

export interface FormElements extends HTMLFormControlsCollection {
  videoUrl?: HTMLInputElement;
}
