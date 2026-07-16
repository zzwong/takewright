import {mkdtemp, rm, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {CliError, formatFromArgs, gifScale, outputTypes, writeJson} from '../scripts/shared';

describe('formatFromArgs', () => {
  it('defaults to the first configured format and mp4', () => {
    expect(formatFromArgs([], ['portrait', 'landscape'])).toEqual({formats: ['portrait'], outputType: 'mp4', skipRecording: false, smoke: false});
  });

  it('falls back to landscape when no defaults are configured', () => {
    expect(formatFromArgs([], []).formats).toEqual(['landscape']);
  });

  it('honors --format', () => {
    expect(formatFromArgs(['--format', 'square'], ['landscape']).formats).toEqual(['square']);
  });

  it('expands --all to every format', () => {
    expect(formatFromArgs(['--all'], ['landscape']).formats).toEqual(['landscape', 'portrait', 'square', 'social-portrait']);
  });

  it('rejects combining --all with --format', () => {
    expect(() => formatFromArgs(['--all', '--format', 'square'], ['landscape'])).toThrow(CliError);
  });

  it('rejects unknown format names', () => {
    expect(() => formatFromArgs(['--format', 'widescreen'], ['landscape'])).toThrow(/Unknown format/);
  });

  it('rejects a --format flag with no value', () => {
    expect(() => formatFromArgs(['--format'], ['landscape'])).toThrow(CliError);
  });

  it('parses --output gif and rejects unknown output types', () => {
    expect(formatFromArgs(['--output', 'gif'], ['landscape']).outputType).toBe('gif');
    expect(() => formatFromArgs(['--output', 'webm'], ['landscape'])).toThrow(/Unknown output type/);
    expect(() => formatFromArgs(['--output'], ['landscape'])).toThrow(CliError);
  });

  it('parses boolean flags', () => {
    const parsed = formatFromArgs(['--skip-recording', '--smoke'], ['landscape']);
    expect(parsed.skipRecording).toBe(true);
    expect(parsed.smoke).toBe(true);
  });
});

describe('constants', () => {
  it('exposes the documented output types and GIF scale', () => {
    expect(outputTypes).toEqual(['mp4', 'gif']);
    expect(gifScale).toBeCloseTo(2 / 3);
  });
});

describe('writeJson', () => {
  let dir: string;
  afterEach(async () => { if (dir) await rm(dir, {recursive: true, force: true}); });

  it('writes pretty JSON with a trailing newline', async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'takewright-test-'));
    const file = path.join(dir, 'value.json');
    await writeJson(file, {a: 1});
    const text = await readFile(file, 'utf8');
    expect(text).toBe('{\n  "a": 1\n}\n');
  });
});

describe('CliError', () => {
  it('carries a message and optional hint', () => {
    const error = new CliError('broken', 'fix it');
    expect(error.name).toBe('CliError');
    expect(error.message).toBe('broken');
    expect(error.hint).toBe('fix it');
    expect(new CliError('broken').hint).toBeUndefined();
  });
});
