import type {CSSProperties} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Background} from '../backgrounds/Background';
import {CalloutOverlay, CaptionOverlay, Title} from '../components/Overlays';
import {TerminalFrame} from '../components/TerminalFrame';
import {formatPresets} from '../presets';
import type {CompositionProps} from '../types';

const zoomTransform = (frame: number, zooms: CompositionProps['config']['zooms']): CSSProperties => {
  const zoom = zooms.find((item) => frame >= item.startFrame - 10 && frame <= item.endFrame + 10);
  if (!zoom) return {transform: 'scale(1) translate(0, 0)'};
  const rampIn = interpolate(frame, [zoom.startFrame - 10, zoom.startFrame + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rampOut = interpolate(frame, [zoom.endFrame - 8, zoom.endFrame + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const amount = Math.min(rampIn, rampOut);
  const scale = 1 + (zoom.scale - 1) * amount;
  return {transform: `scale(${scale}) translate(${zoom.x * amount * 18}%, ${zoom.y * amount * 18}%)`, transformOrigin: 'center'};
};

export const TerminalDemo = ({config, captions, format, durationFrames, recording}: CompositionProps) => {
  const frame = useCurrentFrame();
  const preset = formatPresets[format];
  const portrait = preset.height > preset.width;
  const baseScale = config.composition.terminalScale * preset.terminalScale * (portrait ? 1.04 : 1);
  const recordingAspect = config.recording.width / config.recording.height;
  const terminalAspect = recordingAspect;
  const entrance = interpolate(frame, [0, Math.max(1, config.timing.introFrames)], [.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outroStart = durationFrames - config.timing.outroFrames;
  const exit = interpolate(frame, [outroStart, durationFrames], [1, .96], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <Background kind={config.composition.background}>
    <div style={{position: 'absolute', inset: `${preset.safeY}px ${preset.safeX}px`, transform: `scale(${entrance * exit})`, opacity: interpolate(frame, [0, 8, durationFrames - 8, durationFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
      <TerminalFrame recording={recording} aspectRatio={terminalAspect} scale={Math.min(baseScale, portrait ? .96 : .9)} positionY={config.composition.terminalPositionY + (portrait ? .03 : .04)} showWindowChrome={config.composition.showWindowChrome} cornerRadius={config.composition.cornerRadius} shadow={config.composition.shadow} zoomStyle={zoomTransform(frame, config.zooms)} />
    </div>
    <Title title={config.title} subtitle={config.subtitle} top={preset.titleTop} introFrames={config.timing.introFrames} outroStart={outroStart} />
    <CalloutOverlay callouts={config.callouts} />
    <CaptionOverlay captions={captions} bottom={preset.captionBottom} />
  </Background>;
};
