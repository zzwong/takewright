import {describe, expect, it} from 'vitest';
import {calloutSchema, captionsSchema, demoSchema, formatNames, zoomSchema} from '../src/schema';

const minimalDemo = {id: 'my-demo', title: 'My Demo'};

describe('demoSchema', () => {
  it('accepts a minimal config and fills defaults', () => {
    const parsed = demoSchema.parse(minimalDemo);
    expect(parsed.recording).toEqual({tape: 'demo.tape', width: 1440, height: 900});
    expect(parsed.composition.theme).toBe('ghostty-dark');
    expect(parsed.composition.terminalScale).toBe(0.86);
    expect(parsed.timing).toEqual({introFrames: 30, outroFrames: 30});
    expect(parsed.formats).toEqual(['landscape', 'portrait', 'square']);
    expect(parsed.captions).toBe('captions.json');
    expect(parsed.zooms).toEqual([]);
    expect(parsed.callouts).toEqual([]);
    expect(parsed.description).toBe('');
  });

  it.each(['My-Demo', 'demo_1', '-demo', 'demo-', 'demo--x', ''])('rejects non-kebab-case id %j', (id) => {
    expect(demoSchema.safeParse({...minimalDemo, id}).success).toBe(false);
  });

  it.each(['a', 'demo', 'account-import', 'demo-2-final'])('accepts kebab-case id %j', (id) => {
    expect(demoSchema.safeParse({...minimalDemo, id}).success).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(demoSchema.safeParse({...minimalDemo, title: ''}).success).toBe(false);
  });

  it('bounds recording dimensions', () => {
    expect(demoSchema.safeParse({...minimalDemo, recording: {width: 639, height: 900}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, recording: {width: 3841, height: 900}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, recording: {width: 1440, height: 399}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, recording: {width: 1440, height: 2161}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, recording: {width: 640, height: 400}}).success).toBe(true);
    expect(demoSchema.safeParse({...minimalDemo, recording: {width: 3840, height: 2160}}).success).toBe(true);
  });

  it('bounds composition values', () => {
    expect(demoSchema.safeParse({...minimalDemo, composition: {terminalScale: 0.44}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, composition: {terminalScale: 1.01}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, composition: {terminalPositionY: 0.41}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, composition: {cornerRadius: 41}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, composition: {background: 'neon'}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, composition: {theme: 'other'}}).success).toBe(false);
  });

  it('rejects an empty formats array and unknown format names', () => {
    expect(demoSchema.safeParse({...minimalDemo, formats: []}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, formats: ['widescreen']}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, formats: [...formatNames]}).success).toBe(true);
  });

  it('rejects negative timing frames', () => {
    expect(demoSchema.safeParse({...minimalDemo, timing: {introFrames: -1, outroFrames: 30}}).success).toBe(false);
    expect(demoSchema.safeParse({...minimalDemo, timing: {introFrames: 0, outroFrames: 0}}).success).toBe(true);
  });
});

describe('zoomSchema', () => {
  const base = {startFrame: 10, endFrame: 40, scale: 1.2};

  it('accepts a valid zoom and defaults x/y to 0', () => {
    const parsed = zoomSchema.parse(base);
    expect(parsed.x).toBe(0);
    expect(parsed.y).toBe(0);
  });

  it('requires endFrame > startFrame', () => {
    expect(zoomSchema.safeParse({...base, startFrame: 40, endFrame: 40}).success).toBe(false);
    expect(zoomSchema.safeParse({...base, startFrame: 41, endFrame: 40}).success).toBe(false);
  });

  it('bounds scale to 1..1.6 and offsets to -1..1', () => {
    expect(zoomSchema.safeParse({...base, scale: 0.99}).success).toBe(false);
    expect(zoomSchema.safeParse({...base, scale: 1.61}).success).toBe(false);
    expect(zoomSchema.safeParse({...base, x: 1.5}).success).toBe(false);
    expect(zoomSchema.safeParse({...base, y: -1.5}).success).toBe(false);
    expect(zoomSchema.safeParse({...base, scale: 1.6, x: 1, y: -1}).success).toBe(true);
  });

  it('rejects fractional or negative frames', () => {
    expect(zoomSchema.safeParse({...base, startFrame: 1.5}).success).toBe(false);
    expect(zoomSchema.safeParse({...base, startFrame: -1}).success).toBe(false);
  });
});

describe('calloutSchema', () => {
  const base = {startFrame: 0, endFrame: 30, text: 'Look here'};

  it('defaults position to bottom and rejects unknown positions', () => {
    expect(calloutSchema.parse(base).position).toBe('bottom');
    expect(calloutSchema.safeParse({...base, position: 'center'}).success).toBe(false);
  });

  it('bounds text length', () => {
    expect(calloutSchema.safeParse({...base, text: ''}).success).toBe(false);
    expect(calloutSchema.safeParse({...base, text: 'x'.repeat(181)}).success).toBe(false);
    expect(calloutSchema.safeParse({...base, text: 'x'.repeat(180)}).success).toBe(true);
  });
});

describe('captionsSchema', () => {
  it('accepts an empty array', () => {
    expect(captionsSchema.parse([])).toEqual([]);
  });

  it('validates each caption range and text', () => {
    expect(captionsSchema.safeParse([{startFrame: 0, endFrame: 30, text: 'ok'}]).success).toBe(true);
    expect(captionsSchema.safeParse([{startFrame: 30, endFrame: 30, text: 'bad range'}]).success).toBe(false);
    expect(captionsSchema.safeParse([{startFrame: 0, endFrame: 30, text: 'x'.repeat(241)}]).success).toBe(false);
  });
});
