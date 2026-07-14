import {z} from 'zod';

export const formatNames = ['landscape', 'portrait', 'square', 'social-portrait'] as const;
export type FormatName = (typeof formatNames)[number];

const timedRange = z.object({
  startFrame: z.number().int().nonnegative(),
  endFrame: z.number().int().positive(),
}).refine((range) => range.endFrame > range.startFrame, 'endFrame must be greater than startFrame');

export const zoomSchema = timedRange.and(z.object({
  scale: z.number().min(1).max(1.6),
  x: z.number().min(-1).max(1).default(0),
  y: z.number().min(-1).max(1).default(0),
}));

export const calloutSchema = timedRange.and(z.object({
  text: z.string().min(1).max(180),
  position: z.enum(['top', 'bottom', 'left', 'right']).default('bottom'),
}));

export const captionSchema = timedRange.and(z.object({
  text: z.string().min(1).max(240),
}));

export const demoSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().default(''),
  recording: z.object({
    tape: z.string().default('demo.tape'),
    width: z.number().int().min(640).max(3840).default(1440),
    height: z.number().int().min(400).max(2160).default(900),
  }).default({tape: 'demo.tape', width: 1440, height: 900}),
  composition: z.object({
    theme: z.enum(['ghostty-dark']).default('ghostty-dark'),
    background: z.enum(['gradient', 'dark-neutral', 'light-neutral']).default('gradient'),
    terminalScale: z.number().min(0.45).max(1).default(0.86),
    terminalPositionY: z.number().min(-0.4).max(0.4).default(0),
    showWindowChrome: z.boolean().default(true),
    cornerRadius: z.number().min(0).max(40).default(18),
    shadow: z.boolean().default(true),
  }).default({theme: 'ghostty-dark', background: 'gradient', terminalScale: 0.86, terminalPositionY: 0, showWindowChrome: true, cornerRadius: 18, shadow: true}),
  timing: z.object({
    introFrames: z.number().int().nonnegative().default(30),
    outroFrames: z.number().int().nonnegative().default(30),
  }).default({introFrames: 30, outroFrames: 30}),
  formats: z.array(z.enum(formatNames)).min(1).default(['landscape', 'portrait', 'square']),
  captions: z.string().default('captions.json'),
  zooms: z.array(zoomSchema).default([]),
  callouts: z.array(calloutSchema).default([]),
  future: z.object({
    backgroundImage: z.string().optional(),
    narration: z.string().optional(),
    backgroundMusic: z.string().optional(),
    logo: z.string().optional(),
    subtitleTrack: z.string().optional(),
  }).default({}),
});

export const captionsSchema = z.array(captionSchema);
export type DemoConfig = z.infer<typeof demoSchema>;
export type Caption = z.infer<typeof captionSchema>;
