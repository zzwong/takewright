import {describe, expect, it} from 'vitest';
import {formatPresets} from '../src/presets';
import {formatNames} from '../src/schema';

describe('formatPresets', () => {
  it('defines a preset for every schema format name', () => {
    expect(Object.keys(formatPresets).sort()).toEqual([...formatNames].sort());
  });

  it.each(formatNames)('%s has sane dimensions and safe areas', (name) => {
    const preset = formatPresets[name];
    expect(preset.width).toBeGreaterThanOrEqual(1080);
    expect(preset.height).toBeGreaterThanOrEqual(1080);
    expect(preset.terminalScale).toBeGreaterThan(0);
    expect(preset.terminalScale).toBeLessThanOrEqual(1);
    // Safe areas must leave room for actual content.
    expect(preset.safeX * 2).toBeLessThan(preset.width / 2);
    expect(preset.safeY * 2).toBeLessThan(preset.height / 2);
  });

  it('matches documented output resolutions', () => {
    expect(formatPresets.landscape).toMatchObject({width: 1920, height: 1080});
    expect(formatPresets.portrait).toMatchObject({width: 1080, height: 1920});
    expect(formatPresets.square).toMatchObject({width: 1080, height: 1080});
    expect(formatPresets['social-portrait']).toMatchObject({width: 1080, height: 1350});
  });
});
