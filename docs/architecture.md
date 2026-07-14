# Architecture

## Pipeline

```text
demo.tape ──VHS──> public/recordings/<id>.mp4 ─┐
demo.json + captions.json ──Zod───────────────┼─> Remotion ─> output variants
                                              │                  │
format preset + React components ─────────────┘                  └─FFmpeg─> frames/contact sheet
                                                                    └─FFprobe─> manifest/checks
```

The source of truth stays diffable. VHS replaces live typing with a tape interpreter. Remotion replaces a GUI timeline with React components, frame math, and JSON. FFprobe provides machine-readable gates before and after composition; FFmpeg extracts review artifacts.

## Boundaries

- `demos/` contains authored demo definitions and demo-owned assets.
- `src/` contains reusable rendering code, safe-area presets, CSS backgrounds, and theme tokens.
- `scripts/` contains typed orchestration and media validation.
- `public/recordings/` contains generated raw media available through Remotion's `staticFile()`.
- `output/` contains disposable final and inspection outputs.

This separation lets an agent revise terminal content without touching rendering code, or improve a shared frame without changing tapes.

## Duration and formats

FFprobe supplies raw duration. The orchestration converts it to 30 fps frames and adds configured outro frames. `calculateMetadata()` passes that duration to Remotion. Every format uses its own dimensions, safe area, title/caption offsets, and terminal scale. The terminal maintains the configured source aspect ratio; portrait uses a narrower frame rather than cropping the final landscape video. Final MP4s use H.264 at the preset's full resolution. Final GIFs use Remotion's native GIF codec, every second frame for approximately 15 fps, and two-thirds scale for practical social upload sizes. GIF's centisecond timebase may be reported by FFprobe as 16.67 fps.

## Determinism

The example pins locale, timezone, home directory, font, frame rate, dimensions, typing speed, theme, and cursor behavior. It calls a fixture with static output and uses no network. Dependencies are locked by `pnpm-lock.yaml`; Remotion and Zod versions are exact because Remotion requires version alignment.

Remaining nondeterminism includes encoder byte-level differences across FFmpeg builds, font rasterization across operating systems, and process scheduling around terminal readiness. Media semantics and dimensions are validated rather than asserting byte-identical MP4 output.

## Extension points

The schema reserves a `future` object for background images, narration, music, logos, and subtitle tracks. Add functionality by introducing a validated typed field, a reusable component, and validation checks. Timed arrays already establish the pattern used by zooms, callouts, and captions; cursor highlights and code regions can follow it without replacing the configuration format.
