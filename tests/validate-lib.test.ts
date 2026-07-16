import {describe, expect, it} from 'vitest';
import {demoSchema, type Caption, type DemoConfig} from '../src/schema';
import {CliError} from '../scripts/shared';
import {validateDemo} from '../scripts/validate-lib';

// example-demo is checked in, so its tape and captions files exist on disk.
const exampleConfig = (overrides: Partial<DemoConfig> = {}): DemoConfig => ({
  ...demoSchema.parse({id: 'example-demo', title: 'Example'}),
  ...overrides,
});

const noRecording = {requireRecording: false, validateOutputs: false} as const;

describe('validateDemo', () => {
  it('passes for the checked-in example demo without a recording', async () => {
    const result = await validateDemo(exampleConfig(), [], ['landscape'], noRecording);
    expect(result.warnings).toEqual([]);
    expect(result.recordingDurationFrames).toBeUndefined();
  });

  it('errors when required demo files are missing', async () => {
    const config = demoSchema.parse({id: 'does-not-exist', title: 'Missing'});
    await expect(validateDemo(config, [], ['landscape'], noRecording)).rejects.toThrow(/Missing required file/);
  });

  it('errors when the recording is required but absent', async () => {
    const config = demoSchema.parse({id: 'does-not-exist', title: 'Missing'});
    await expect(validateDemo(config, [], ['landscape'], {requireRecording: true, validateOutputs: false}))
      .rejects.toThrow(/Raw recording is absent/);
  });

  it('errors on overlapping captions', async () => {
    const captions: Caption[] = [
      {startFrame: 0, endFrame: 60, text: 'first'},
      {startFrame: 30, endFrame: 90, text: 'second'},
    ];
    await expect(validateDemo(exampleConfig(), captions, ['landscape'], noRecording)).rejects.toThrow(/Captions overlap/);
  });

  it('allows captions that touch but do not overlap', async () => {
    const captions: Caption[] = [
      {startFrame: 0, endFrame: 60, text: 'first'},
      {startFrame: 60, endFrame: 120, text: 'second'},
    ];
    const result = await validateDemo(exampleConfig(), captions, ['landscape'], noRecording);
    expect(result.warnings).toEqual([]);
  });

  it('errors on overlapping zooms', async () => {
    const config = exampleConfig({zooms: [
      {startFrame: 0, endFrame: 50, scale: 1.2, x: 0, y: 0},
      {startFrame: 40, endFrame: 90, scale: 1.1, x: 0, y: 0},
    ]});
    await expect(validateDemo(config, [], ['landscape'], noRecording)).rejects.toThrow(/Zoom ranges overlap/);
  });

  it('warns (does not error) on overlapping callouts', async () => {
    const config = exampleConfig({callouts: [
      {startFrame: 0, endFrame: 50, text: 'one', position: 'bottom'},
      {startFrame: 40, endFrame: 90, text: 'two', position: 'top'},
    ]});
    const result = await validateDemo(config, [], ['landscape'], noRecording);
    expect(result.warnings).toContain('Callouts overlap; only the first active callout will display.');
  });

  it('warns on captions shorter than 24 frames', async () => {
    const captions: Caption[] = [{startFrame: 0, endFrame: 23, text: 'blink'}];
    const result = await validateDemo(exampleConfig(), captions, ['landscape'], noRecording);
    expect(result.warnings.some((warning) => warning.includes('less than 0.8 seconds'))).toBe(true);
  });

  it('collects multiple errors into one CliError', async () => {
    const config = exampleConfig({zooms: [
      {startFrame: 0, endFrame: 50, scale: 1.2, x: 0, y: 0},
      {startFrame: 40, endFrame: 90, scale: 1.1, x: 0, y: 0},
    ]});
    const captions: Caption[] = [
      {startFrame: 0, endFrame: 60, text: 'first'},
      {startFrame: 30, endFrame: 90, text: 'second'},
    ];
    const failure = await validateDemo(config, captions, ['landscape'], noRecording).then(() => null, (error: unknown) => error);
    expect(failure).toBeInstanceOf(CliError);
    expect((failure as CliError).message).toMatch(/Captions overlap/);
    expect((failure as CliError).message).toMatch(/Zoom ranges overlap/);
  });
});
