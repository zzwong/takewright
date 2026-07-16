import {access, mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {execa, type Options} from 'execa';
import {captionsSchema, demoSchema, formatNames, type Caption, type DemoConfig, type FormatName} from '../src/schema';

export const root = path.resolve(import.meta.dirname, '..');
export const fps = 30;
export const outputTypes = ['mp4', 'gif'] as const;
export type OutputType = (typeof outputTypes)[number];
export const gifScale = 2 / 3;

export class CliError extends Error {
  constructor(message: string, readonly hint?: string) {
    super(message);
    this.name = 'CliError';
  }
}

export const fail = (error: unknown): never => {
  if (error instanceof CliError) {
    console.error(`\nError: ${error.message}`);
    if (error.hint) console.error(`Fix: ${error.hint}`);
  } else if (error instanceof Error) {
    console.error(`\nUnexpected error: ${error.message}`);
  } else {
    console.error(`\nUnexpected error: ${String(error)}`);
  }
  process.exit(1);
};

export const exists = async (file: string) => access(file).then(() => true, () => false);

export const run = async (step: string, command: string, args: string[], options: Options = {}) => {
  try {
    return await execa(command, args, {cwd: root, ...options});
  } catch (error: any) {
    const stderr = String(error?.stderr ?? error?.shortMessage ?? error?.message ?? error).trim();
    throw new CliError(`${step} failed while running: ${[command, ...args].join(' ')}\n${stderr}`, `Correct the command or dependency problem above, then rerun ${step}.`);
  }
};

export const loadDemo = async (id: string): Promise<{config: DemoConfig; captions: Caption[]; demoDir: string}> => {
  const demoDir = path.join(root, 'demos', id);
  let configText: string;
  try {
    configText = await readFile(path.join(demoDir, 'demo.json'), 'utf8');
  } catch {
    throw new CliError(`Demo "${id}" was not found.`, `Run "pnpm demo:new ${id}" first.`);
  }
  let raw: unknown;
  try { raw = JSON.parse(configText); } catch { throw new CliError(`${id}/demo.json is not valid JSON.`, 'Fix the JSON syntax and rerun the command.'); }
  const parsed = demoSchema.safeParse(raw);
  if (!parsed.success) throw new CliError(`${id}/demo.json is invalid:\n${parsed.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n')}`, 'Update the listed configuration fields.');
  if (parsed.data.id !== id) throw new CliError(`Directory ID "${id}" does not match demo.json ID "${parsed.data.id}".`, 'Make the directory name and id field identical.');
  const captionPath = path.join(demoDir, parsed.data.captions);
  let captionRaw: unknown;
  try { captionRaw = JSON.parse(await readFile(captionPath, 'utf8')); } catch { throw new CliError(`Cannot read captions file ${path.relative(root, captionPath)}.`, 'Create a valid JSON caption array at that path.'); }
  const captionResult = captionsSchema.safeParse(captionRaw);
  if (!captionResult.success) throw new CliError(`Captions are invalid:\n${captionResult.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n')}`, 'Fix the listed caption fields.');
  return {config: parsed.data, captions: captionResult.data, demoDir};
};

export type MediaProbe = {
  duration: number;
  width: number;
  height: number;
  codec: string;
  frameRate: number;
  hasAudio: boolean;
  size: number;
};

export const probeMedia = async (file: string): Promise<MediaProbe> => {
  if (!(await exists(file))) throw new CliError(`Media file is missing: ${path.relative(root, file)}`, 'Render or record the demo before continuing.');
  const info = await stat(file);
  if (info.size === 0) throw new CliError(`Media file is empty: ${path.relative(root, file)}`, 'Delete the empty file and rerender it.');
  const result = await run('ffprobe', 'ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]);
  const data = JSON.parse(String(result.stdout));
  const video = data.streams?.find((stream: any) => stream.codec_type === 'video');
  if (!video) throw new CliError(`No video stream found in ${path.relative(root, file)}.`, 'Ensure FFmpeg produced a valid MP4 video.');
  const [num, den] = String(video.avg_frame_rate ?? '0/1').split('/').map(Number);
  return {
    duration: Number(data.format?.duration ?? video.duration ?? 0), width: Number(video.width), height: Number(video.height),
    codec: String(video.codec_name ?? 'unknown'), frameRate: den ? (num ?? 0) / den : 0,
    hasAudio: Boolean(data.streams?.some((stream: any) => stream.codec_type === 'audio')), size: info.size,
  };
};

export const formatFromArgs = (args: string[], defaults: FormatName[]): {formats: FormatName[]; outputType: OutputType; skipRecording: boolean; smoke: boolean} => {
  const all = args.includes('--all');
  const skipRecording = args.includes('--skip-recording');
  const smoke = args.includes('--smoke');
  const index = args.indexOf('--format');
  const requested = index >= 0 ? args[index + 1] : undefined;
  const outputIndex = args.indexOf('--output');
  const requestedOutput = outputIndex >= 0 ? args[outputIndex + 1] : undefined;
  if (index >= 0 && !formatNames.includes(requested as FormatName)) throw new CliError(`Unknown format "${requested ?? ''}".`, `Choose one of: ${formatNames.join(', ')}.`);
  if (outputIndex >= 0 && !outputTypes.includes(requestedOutput as OutputType)) throw new CliError(`Unknown output type "${requestedOutput ?? ''}".`, `Choose one of: ${outputTypes.join(', ')}.`);
  if (all && requested) throw new CliError('Use either --all or --format, not both.');
  return {formats: all ? [...formatNames] : requested ? [requested as FormatName] : defaults.length ? [defaults[0]!] : ['landscape'], outputType: (requestedOutput as OutputType | undefined) ?? 'mp4', skipRecording, smoke};
};

export const ensureDirs = async (id: string) => {
  await mkdir(path.join(root, 'public', 'recordings'), {recursive: true});
  await mkdir(path.join(root, 'output', id), {recursive: true});
};

export const writeJson = async (file: string, value: unknown) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
