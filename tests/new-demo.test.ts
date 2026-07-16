import {readFile, rm} from 'node:fs/promises';
import path from 'node:path';
import {execa} from 'execa';
import {afterEach, describe, expect, it} from 'vitest';
import {demoSchema} from '../src/schema';
import {exists, root} from '../scripts/shared';

const tsx = path.join(root, 'node_modules', '.bin', 'tsx');
const script = path.join(root, 'scripts', 'new-demo.ts');
const testId = 'test-tmp-scaffold';
const testDir = path.join(root, 'demos', testId);

const runNewDemo = (args: string[]) => execa(tsx, [script, ...args], {cwd: root, reject: false});

afterEach(async () => { await rm(testDir, {recursive: true, force: true}); });

describe('demo:new', () => {
  it('scaffolds a demo whose config passes the schema', async () => {
    const result = await runNewDemo([testId]);
    expect(result.exitCode).toBe(0);
    const config = demoSchema.parse(JSON.parse(await readFile(path.join(testDir, 'demo.json'), 'utf8')));
    expect(config.id).toBe(testId);
    expect(config.recording).toMatchObject({width: 1440, height: 900});
    expect(config.formats).toEqual(['landscape', 'portrait', 'square', 'social-portrait']);
    expect(JSON.parse(await readFile(path.join(testDir, 'captions.json'), 'utf8'))).toEqual([]);
    const tape = await readFile(path.join(testDir, 'demo.tape'), 'utf8');
    expect(tape).toContain(`Output public/recordings/${testId}.mp4`);
    expect(tape).toContain('Set Width 1440');
    expect(await exists(path.join(testDir, 'README.md'))).toBe(true);
    expect(await exists(path.join(testDir, 'assets'))).toBe(true);
  });

  it('applies the slack-landscape preset', async () => {
    const result = await runNewDemo([testId, '--preset', 'slack-landscape']);
    expect(result.exitCode).toBe(0);
    const config = demoSchema.parse(JSON.parse(await readFile(path.join(testDir, 'demo.json'), 'utf8')));
    expect(config.recording).toMatchObject({width: 1200, height: 700});
    expect(config.formats).toEqual(['landscape']);
    expect(config.composition.terminalScale).toBe(0.72);
    const tape = await readFile(path.join(testDir, 'demo.tape'), 'utf8');
    expect(tape).toContain('Set FontSize 25');
  });

  it('rejects unknown presets', async () => {
    const result = await runNewDemo([testId, '--preset', 'youtube']);
    expect(result.exitCode).toBe(1);
    expect(String(result.stderr)).toMatch(/Unknown preset/);
  });

  it('rejects invalid IDs', async () => {
    for (const id of ['Bad_Id', 'UPPER', 'trailing-']) {
      const result = await runNewDemo([id]);
      expect(result.exitCode).toBe(1);
      expect(String(result.stderr)).toMatch(/kebab-case/);
    }
  });

  it('never overwrites an existing demo', async () => {
    expect((await runNewDemo([testId])).exitCode).toBe(0);
    const second = await runNewDemo([testId]);
    expect(second.exitCode).toBe(1);
    expect(String(second.stderr)).toMatch(/already exists/);
  });
});
