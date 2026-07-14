#!/usr/bin/env node
import path from 'node:path';
import {rm} from 'node:fs/promises';
import {formatPresets} from '../src/presets';
import {CliError, ensureDirs, exists, fail, formatFromArgs, fps, gifScale, loadDemo, probeMedia, root, run, writeJson} from './shared';
import {validateDemo} from './validate-lib';

const renderRecording = async (id: string, tape: string) => {
  const tapePath = path.join('demos', id, tape);
  if (await exists(path.join(root, 'node_modules', '.bin', 'vhs'))) await run('VHS recording', path.join(root, 'node_modules', '.bin', 'vhs'), [tapePath], {stdio: 'inherit'});
  else if (await run('VHS availability', 'vhs', ['--version'], {reject: false}).then((result) => result.exitCode === 0)) await run('VHS recording', 'vhs', [tapePath], {stdio: 'inherit'});
  else if (await run('Docker availability', 'docker', ['--version'], {reject: false}).then((result) => result.exitCode === 0)) await run('VHS Docker recording', 'docker', ['run', '--rm', '-v', `${root}:/vhs`, '-w', '/vhs', 'ghcr.io/charmbracelet/vhs', tapePath], {stdio: 'inherit'});
  else throw new CliError('VHS is not installed and Docker is unavailable.', 'Install VHS with "brew install vhs" or install/start Docker.');
};

const main = async () => {
  const id = process.argv[2];
  if (!id) throw new CliError('Missing demo ID.', 'Usage: pnpm demo:render <demo-id> [--format <name> | --all] [--output mp4|gif] [--skip-recording]');
  const {config, captions} = await loadDemo(id);
  const {formats, outputType, skipRecording, smoke} = formatFromArgs(process.argv.slice(3), config.formats);
  await ensureDirs(id);
  await validateDemo(config, captions, formats, {requireRecording: false, outputType, validateOutputs: false});
  const recording = path.join(root, 'public', 'recordings', `${id}.mp4`);
  if (!skipRecording) await renderRecording(id, config.recording.tape);
  if (!(await exists(recording))) throw new CliError(`Raw recording was not produced at public/recordings/${id}.mp4.`, 'Check the Output line in the tape or rerun without --skip-recording.');
  const raw = await probeMedia(recording);
  if (raw.width !== config.recording.width || raw.height !== config.recording.height) throw new CliError(`VHS produced ${raw.width}x${raw.height}; configured dimensions are ${config.recording.width}x${config.recording.height}.`, 'Make Set Width/Height in the tape match demo.json.');
  const durationFrames = smoke ? Math.min(90, Math.ceil(raw.duration * fps)) : Math.ceil(raw.duration * fps) + config.timing.outroFrames;
  for (const format of formats) {
    const output = path.join(root, 'output', id, `${id}-${format}.${outputType}`);
    const propsPath = path.join(root, 'output', id, `.props-${format}.json`);
    await writeJson(propsPath, {config, captions, format, durationFrames, recording: `recordings/${id}.mp4`, smoke});
    const scale = smoke ? '0.25' : outputType === 'gif' ? String(gifScale) : '1';
    const outputArgs = outputType === 'gif' ? ['--codec', 'gif', '--every-nth-frame', '2'] : [];
    await run(`Remotion ${format} ${outputType} render`, 'pnpm', ['exec', 'remotion', 'render', 'src/index.tsx', `TerminalDemo-${format}`, output, '--props', propsPath, '--scale', scale, ...outputArgs, '--log', 'error'], {stdio: 'inherit'});
    await rm(propsPath, {force: true});
    const media = await probeMedia(output);
    const preset = formatPresets[format];
    const expectedWidth = Math.round(preset.width * Number(scale));
    const expectedHeight = Math.round(preset.height * Number(scale));
    if (media.width !== expectedWidth || media.height !== expectedHeight) throw new CliError(`${format} render dimensions are ${media.width}x${media.height}; expected ${expectedWidth}x${expectedHeight}.`);
    if (outputType === 'gif' && media.codec !== 'gif') throw new CliError(`${format} GIF render uses codec ${media.codec}; expected gif.`);
    console.log(`✓ ${path.relative(root, output)} (${media.width}x${media.height}, ${media.duration.toFixed(2)}s, ${media.codec})`);
  }
};
main().catch(fail);
