#!/usr/bin/env node
import {mkdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {CliError, exists, fail, root, run} from './shared';

type Check = {name: string; ok: boolean; detail: string; fix?: string};

const executable = async (name: string, args: string[], fix: string): Promise<Check> => {
  const result = await run(`${name} check`, name, args, {reject: false});
  const detail = String(result.stdout || result.stderr || 'available').split('\n')[0] || 'available';
  return result.exitCode === 0 ? {name, ok: true, detail} : {name, ok: false, detail: 'not executable', fix};
};

// Known install locations first, then fontconfig as the authoritative Linux fallback.
const fontCheck = async (): Promise<Check> => {
  const home = process.env.HOME ?? '';
  const candidates = process.platform === 'darwin'
    ? [path.join(home, 'Library/Fonts/JetBrainsMono-Regular.ttf'), '/Library/Fonts/JetBrainsMono-Regular.ttf']
    : [
        '/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf',
        '/usr/share/fonts/opentype/jetbrains-mono/JetBrainsMono-Regular.ttf',
        path.join(home, '.local/share/fonts/JetBrainsMono-Regular.ttf'),
        path.join(home, '.fonts/JetBrainsMono-Regular.ttf'),
      ];
  const found = (await Promise.all(candidates.map(async (candidate) => (await exists(candidate)) ? candidate : null))).find(Boolean);
  if (found) return {name: 'JetBrains Mono font', ok: true, detail: found};
  if (process.platform !== 'darwin') {
    const fc = await run('fontconfig check', 'fc-list', [':family=JetBrains Mono', 'file'], {reject: false});
    const line = String(fc.stdout ?? '').split('\n').find((entry) => entry.trim());
    if (fc.exitCode === 0 && line) return {name: 'JetBrains Mono font', ok: true, detail: line.replace(/:\s*$/, '').trim()};
  }
  return {
    name: 'JetBrains Mono font', ok: false, detail: 'font not found',
    fix: process.platform === 'darwin' ? 'Install with "brew install --cask font-jetbrains-mono".' : 'Install JetBrains Mono or use the official VHS action, which provides it.',
  };
};

const main = async () => {
  const [nodeCheck, pnpmCheck, vhsCheck, ffmpegCheck, ffprobeCheck] = await Promise.all([
    executable('node', ['--version'], 'Install Node.js 22 or newer.'),
    executable('pnpm', ['--version'], 'Enable Corepack or install pnpm.'),
    executable('vhs', ['--version'], 'Install VHS 0.11 or newer.'),
    executable('ffmpeg', ['-version'], 'Install FFmpeg with your system package manager.'),
    executable('ffprobe', ['-version'], 'Install FFmpeg, which includes ffprobe.'),
  ]);
  let recorderCheck: Check;
  if (vhsCheck.ok) recorderCheck = {name: 'terminal recorder', ok: true, detail: `native VHS (${vhsCheck.detail})`};
  else {
    const dockerCheck = await executable('docker', ['info', '--format', '{{.ServerVersion}}'], 'Install and start Docker.');
    recorderCheck = dockerCheck.ok
      ? {name: 'terminal recorder', ok: true, detail: `Docker fallback (${dockerCheck.detail})`}
      : {name: 'terminal recorder', ok: false, detail: 'neither VHS nor a running Docker daemon is available', fix: 'Install VHS 0.11 or newer, or install and start Docker.'};
  }
  const checks: Check[] = [nodeCheck, pnpmCheck, recorderCheck, ffmpegCheck, ffprobeCheck];
  const out = path.join(root, 'output', '.doctor-write-test');
  try { await mkdir(path.dirname(out), {recursive: true}); await writeFile(out, 'ok'); await rm(out); checks.push({name: 'output directory', ok: true, detail: 'writable'}); }
  catch { checks.push({name: 'output directory', ok: false, detail: 'not writable', fix: 'Grant write permission to output/.'}); }
  checks.push(await fontCheck());
  const doctorRecording = path.join(root, 'public', 'recordings', '.doctor.mp4');
  const doctorOutput = path.join(root, 'output', '.doctor.png');
  try {
    await mkdir(path.dirname(doctorRecording), {recursive: true});
    await run('doctor fixture generation', 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=#11131a:s=1440x900:d=1:r=30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', doctorRecording]);
    const props = JSON.stringify({config: {id:'doctor',title:'Doctor render',description:'',recording:{tape:'demo.tape',width:1440,height:900},composition:{theme:'ghostty-dark',background:'dark-neutral',terminalScale:.86,terminalPositionY:0,showWindowChrome:true,cornerRadius:18,shadow:true},timing:{introFrames:8,outroFrames:8},formats:['landscape'],captions:'captions.json',zooms:[],callouts:[],future:{}},captions:[],format:'landscape',durationFrames:30,recording:'recordings/.doctor.mp4'});
    await run('Remotion frame render', 'pnpm', ['exec', 'remotion', 'still', 'src/index.tsx', 'TerminalDemo-landscape', doctorOutput, '--props', props, '--scale', '0.1', '--log', 'error']);
    checks.push({name: 'Remotion render', ok: await exists(doctorOutput), detail: 'trivial frame rendered'});
  } catch (error) {
    checks.push({name: 'Remotion render', ok: false, detail: error instanceof Error ? error.message : String(error), fix: 'Run pnpm install and ensure Chrome can be provisioned by Remotion.'});
  } finally { await rm(doctorRecording, {force: true}); await rm(doctorOutput, {force: true}); }
  for (const check of checks) console.log(`${check.ok ? '✓' : '✗'} ${check.name}: ${check.detail}${check.fix ? `\n  Fix: ${check.fix}` : ''}`);
  if (checks.some((check) => !check.ok)) throw new CliError('Doctor found one or more blocking problems.', 'Apply the fixes printed above and rerun pnpm demo:doctor.');
};
main().catch(fail);
