#!/usr/bin/env node
import {mkdir, rm} from 'node:fs/promises';
import path from 'node:path';
import {formatPresets} from '../src/presets';
import type {FormatName} from '../src/schema';
import {CliError, fail, formatFromArgs, loadDemo, probeMedia, root, run, writeJson} from './shared';

const main = async () => {
  const id = process.argv[2];
  if (!id) throw new CliError('Missing demo ID.', 'Usage: pnpm demo:inspect <demo-id> [--format landscape] [--output mp4|gif]');
  const {config, captions} = await loadDemo(id);
  const {formats, outputType} = formatFromArgs(process.argv.slice(3), config.formats);
  const format: FormatName = formats[0]!;
  const video = path.join(root, 'output', id, `${id}-${format}.${outputType}`);
  const media = await probeMedia(video);
  const candidates = [
    {seconds: .5, reason: 'intro'},
    {seconds: Math.min(2, media.duration * .18), reason: 'first-command'},
    ...config.zooms.map((item) => ({seconds: ((item.startFrame + item.endFrame) / 2) / 30, reason: 'zoom'})),
    ...config.callouts.map((item) => ({seconds: ((item.startFrame + item.endFrame) / 2) / 30, reason: 'callout'})),
    {seconds: media.duration / 2, reason: 'middle'},
    {seconds: Math.max(.1, media.duration - 2), reason: 'final-command'},
    {seconds: Math.max(.1, media.duration - .5), reason: 'outro'},
  ].filter((item) => item.seconds < media.duration).sort((a, b) => a.seconds - b.seconds);
  const unique = candidates.filter((item, index) => index === 0 || Math.abs(item.seconds - candidates[index - 1]!.seconds) > .1);
  const dir = path.join(root, 'output', id, 'inspection');
  await rm(dir, {recursive: true, force: true});
  await mkdir(dir, {recursive: true});
  const frames = [];
  for (const [index, item] of unique.entries()) {
    const file = `frame-${String(index + 1).padStart(4, '0')}.png`;
    await run('frame extraction', 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', item.seconds.toFixed(3), '-i', video, '-frames:v', '1', path.join(dir, file)]);
    frames.push({file, timestampSeconds: Number(item.seconds.toFixed(3)), reason: item.reason});
  }
  const pattern = path.join(dir, 'frame-%04d.png');
  await run('contact sheet', 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', pattern, '-vf', "scale=480:-1,tile=3x3:padding=16:margin=16:color=#11131a", '-frames:v', '1', path.join(dir, 'contact-sheet.png')]);
  const expected = formatPresets[format];
  const expectedScale = outputType === 'gif' ? 2 / 3 : 1;
  const checks = {expectedDimensions: media.width === Math.round(expected.width * expectedScale) && media.height === Math.round(expected.height * expectedScale), expectedCodec: media.codec === (outputType === 'gif' ? 'gif' : 'h264'), expectedFrameRate: outputType !== 'gif' || (media.frameRate >= 14 && media.frameRate <= 17), videoReadable: media.duration > 0 && media.size > 0, captionsWithinBounds: captions.every((item) => item.endFrame / 30 <= media.duration)};
  const issues = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  await writeJson(path.join(dir, 'manifest.json'), {demoId: id, format, outputType, videoDurationSeconds: media.duration, media, frames, checks, issues});
  console.log(JSON.stringify({video: path.relative(root, video), inspection: path.relative(root, dir), media, checks, issues}, null, 2));
};
main().catch(fail);
