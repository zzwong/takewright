import type {FormatName} from './schema';

export type FormatPreset = {
  width: number;
  height: number;
  terminalScale: number;
  safeX: number;
  safeY: number;
  titleTop: number;
  captionBottom: number;
};

export const formatPresets: Record<FormatName, FormatPreset> = {
  landscape: {width: 1920, height: 1080, terminalScale: 0.86, safeX: 96, safeY: 64, titleTop: 54, captionBottom: 58},
  portrait: {width: 1080, height: 1920, terminalScale: 0.94, safeX: 72, safeY: 140, titleTop: 170, captionBottom: 210},
  square: {width: 1080, height: 1080, terminalScale: 0.91, safeX: 64, safeY: 72, titleTop: 62, captionBottom: 78},
  'social-portrait': {width: 1080, height: 1350, terminalScale: 0.92, safeX: 70, safeY: 92, titleTop: 88, captionBottom: 110},
};
