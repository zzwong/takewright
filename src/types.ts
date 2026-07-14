import type {Caption, DemoConfig} from './schema';
export type CaptionLike = Caption;
export type Callout = DemoConfig['callouts'][number];

export type CompositionProps = {
  config: DemoConfig;
  captions: Caption[];
  format: import('./schema').FormatName;
  durationFrames: number;
  recording: string;
  smoke?: boolean;
};
