import path from 'node:path';
import {formatPresets} from '../src/presets';
import type {Caption, DemoConfig, FormatName} from '../src/schema';
import {CliError, exists, fps, gifScale, probeMedia, root, type OutputType} from './shared';

type Validation = {warnings: string[]; recordingDurationFrames?: number};
type ValidationOptions = {requireRecording: boolean; outputType?: OutputType; validateOutputs?: boolean};

const overlaps = (ranges: Array<{startFrame: number; endFrame: number}>) => ranges.some((range, index) => ranges.some((other, otherIndex) => index < otherIndex && range.startFrame < other.endFrame && other.startFrame < range.endFrame));

export const validateDemo = async (
  config: DemoConfig,
  captions: Caption[],
  formats: FormatName[],
  {requireRecording, outputType = 'mp4', validateOutputs = true}: ValidationOptions,
): Promise<Validation> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const demoDir = path.join(root, 'demos', config.id);
  for (const file of [config.recording.tape, config.captions]) if (!(await exists(path.join(demoDir, file)))) errors.push(`Missing required file: demos/${config.id}/${file}`);
  if (overlaps(captions)) errors.push('Captions overlap. Keep caption ranges distinct.');
  if (overlaps(config.zooms)) errors.push('Zoom ranges overlap. Only one zoom may be active at a time.');
  if (overlaps(config.callouts)) warnings.push('Callouts overlap; only the first active callout will display.');
  for (const caption of captions) if (caption.endFrame - caption.startFrame < 24) warnings.push(`Caption "${caption.text}" is displayed for less than 0.8 seconds.`);
  const recording = path.join(root, 'public', 'recordings', `${config.id}.mp4`);
  let recordingDurationFrames: number | undefined;
  if (await exists(recording)) {
    const media = await probeMedia(recording);
    recordingDurationFrames = Math.ceil(media.duration * fps);
    if (media.width !== config.recording.width || media.height !== config.recording.height) errors.push(`Raw recording is ${media.width}x${media.height}; expected ${config.recording.width}x${config.recording.height}.`);
    const maxFrame = recordingDurationFrames + config.timing.outroFrames;
    for (const [kind, ranges] of [['caption', captions], ['zoom', config.zooms], ['callout', config.callouts]] as const) {
      for (const range of ranges) if (range.endFrame > maxFrame) errors.push(`${kind} range ending at frame ${range.endFrame} exceeds video bound ${maxFrame}.`);
    }
  } else if (requireRecording) errors.push(`Raw recording is absent: public/recordings/${config.id}.mp4`);
  if (validateOutputs) {
    for (const format of formats) {
      const output = path.join(root, 'output', config.id, `${config.id}-${format}.${outputType}`);
      if (await exists(output)) {
        const media = await probeMedia(output);
        const expected = formatPresets[format];
        const outputScale = outputType === 'gif' ? gifScale : 1;
        const expectedWidth = Math.round(expected.width * outputScale);
        const expectedHeight = Math.round(expected.height * outputScale);
        if (media.width !== expectedWidth || media.height !== expectedHeight) errors.push(`${format} ${outputType} output is ${media.width}x${media.height}; expected ${expectedWidth}x${expectedHeight}.`);
        const expectedCodec = outputType === 'gif' ? 'gif' : 'h264';
        if (media.codec !== expectedCodec) errors.push(`${format} ${outputType} output uses codec ${media.codec}; expected ${expectedCodec}.`);
        if (outputType === 'gif' && (media.frameRate < 14 || media.frameRate > 17)) errors.push(`${format} GIF runs at ${media.frameRate} fps; expected approximately 15 fps.`);
      }
    }
  }
  if (errors.length) throw new CliError(`Validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`, 'Correct the listed files or timing ranges, then validate again.');
  return recordingDurationFrames === undefined ? {warnings} : {warnings, recordingDurationFrames};
};
