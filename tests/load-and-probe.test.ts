import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execa} from 'execa';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {CliError, loadDemo, probeMedia, root} from '../scripts/shared';

describe('loadDemo', () => {
  it('loads the checked-in example demo', async () => {
    const {config, captions, demoDir} = await loadDemo('example-demo');
    expect(config.id).toBe('example-demo');
    expect(config.recording).toEqual({tape: 'demo.tape', width: 1440, height: 900});
    expect(captions.length).toBeGreaterThan(0);
    expect(demoDir).toBe(path.join(root, 'demos', 'example-demo'));
  });

  it('fails with a hint for an unknown demo', async () => {
    const failure = await loadDemo('no-such-demo').then(() => null, (error: unknown) => error);
    expect(failure).toBeInstanceOf(CliError);
    expect((failure as CliError).message).toMatch(/was not found/);
    expect((failure as CliError).hint).toMatch(/demo:new no-such-demo/);
  });
});

describe('loadDemo with malformed inputs', () => {
  // These fixtures live under demos/ because loadDemo resolves from the repo root.
  const dir = path.join(root, 'demos', 'test-tmp-malformed');

  beforeAll(async () => { await rm(dir, {recursive: true, force: true}); });
  afterAll(async () => { await rm(dir, {recursive: true, force: true}); });

  const writeDemo = async (demoJson: string, captionsJson?: string) => {
    await rm(dir, {recursive: true, force: true});
    const {mkdir} = await import('node:fs/promises');
    await mkdir(dir, {recursive: true});
    await writeFile(path.join(dir, 'demo.json'), demoJson);
    if (captionsJson !== undefined) await writeFile(path.join(dir, 'captions.json'), captionsJson);
  };

  it('rejects invalid JSON syntax', async () => {
    await writeDemo('{not json');
    await expect(loadDemo('test-tmp-malformed')).rejects.toThrow(/not valid JSON/);
  });

  it('rejects a config that fails the schema', async () => {
    await writeDemo(JSON.stringify({id: 'test-tmp-malformed', title: ''}));
    await expect(loadDemo('test-tmp-malformed')).rejects.toThrow(/is invalid/);
  });

  it('rejects an id that does not match the directory', async () => {
    await writeDemo(JSON.stringify({id: 'other-id', title: 'Mismatch'}));
    await expect(loadDemo('test-tmp-malformed')).rejects.toThrow(/does not match/);
  });

  it('rejects a missing captions file', async () => {
    await writeDemo(JSON.stringify({id: 'test-tmp-malformed', title: 'No captions'}));
    await expect(loadDemo('test-tmp-malformed')).rejects.toThrow(/Cannot read captions file/);
  });

  it('rejects invalid caption entries', async () => {
    await writeDemo(
      JSON.stringify({id: 'test-tmp-malformed', title: 'Bad captions'}),
      JSON.stringify([{startFrame: 10, endFrame: 5, text: 'backwards'}]),
    );
    await expect(loadDemo('test-tmp-malformed')).rejects.toThrow(/Captions are invalid/);
  });
});

describe('probeMedia', () => {
  let dir: string;

  beforeAll(async () => { dir = await mkdtemp(path.join(tmpdir(), 'takewright-probe-')); });
  afterAll(async () => { await rm(dir, {recursive: true, force: true}); });

  it('reports dimensions, duration, codec, and frame rate for a real video', async () => {
    const file = path.join(dir, 'sample.mp4');
    await execa('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=320x240:d=1:r=30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', file]);
    const media = await probeMedia(file);
    expect(media.width).toBe(320);
    expect(media.height).toBe(240);
    expect(media.codec).toBe('h264');
    expect(media.frameRate).toBeCloseTo(30, 1);
    expect(media.duration).toBeCloseTo(1, 1);
    expect(media.hasAudio).toBe(false);
    expect(media.size).toBeGreaterThan(0);
  });

  it('fails for a missing file', async () => {
    await expect(probeMedia(path.join(dir, 'missing.mp4'))).rejects.toThrow(/missing/);
  });

  it('fails for an empty file', async () => {
    const file = path.join(dir, 'empty.mp4');
    await writeFile(file, '');
    await expect(probeMedia(file)).rejects.toThrow(/empty/);
  });

  it('fails for a file without a video stream', async () => {
    const file = path.join(dir, 'audio-only.m4a');
    await execa('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=d=1', '-c:a', 'aac', '-y', file]);
    await expect(probeMedia(file)).rejects.toThrow(/No video stream/);
  });
});
