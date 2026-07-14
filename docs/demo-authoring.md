# Demo authoring

## Tape

A tape must write `public/recordings/<id>.mp4` and should set shell, dimensions, font, frame rate, typing speed, padding, theme, locale, timezone, and cursor behavior before actions. Use `Hide`/`Show` for setup, `Type` and `Enter` for commands, `Sleep` for deliberate pacing, and `clear` for transitions. Avoid user startup files, aliases, timestamps, random values, network calls, and ambient working directories.

The configured `recording.width` and `recording.height` must match VHS `Set Width` and `Set Height`. Keep raw window chrome disabled; Remotion adds consistent chrome for every format.

## Configuration

Only `id` and `title` are conceptually required; Zod supplies defaults for recording, composition, timing, formats, captions, zooms, callouts, and reserved future media fields. The demo directory name and `id` must match.

Backgrounds are `gradient`, `dark-neutral`, or `light-neutral`. `terminalScale` is a multiplier applied on top of each format's preset. `terminalPositionY` is a normalized vertical offset. Chrome, radius, and shadow are independently configurable.

## Frame timing

All authored timing is at 30 fps. One second is 30 frames.

```json
{"startFrame": 60, "endFrame": 150, "text": "This is visible for three seconds"}
```

`endFrame` is exclusive. Caption ranges cannot overlap and should normally last at least 24 frames. Keep all ranges within the probed final duration.

## Zooms

```json
{"startFrame": 120, "endFrame": 210, "scale": 1.12, "x": 0.08, "y": -0.05}
```

Scale is restricted to 1–1.6. `x` and `y` are normalized directional offsets. The component eases in and out over nearby frames. Prefer 1.06–1.2 and inspect both the beginning and midpoint; aggressive scales can hide command prefixes.

## Callouts

```json
{"startFrame": 180, "endFrame": 270, "text": "Configuration is detected", "position": "bottom"}
```

Positions are `top`, `bottom`, `left`, or `right`. Keep text under 180 characters. Check that a callout does not compete with a caption or cover the active command.

## Captions

Captions live in the configured JSON file as an array of frame ranges. They use high-contrast text, a translucent backing, centered wrapping, and format-specific bottom safe areas. Write concise sentences and avoid duplicating every terminal line.

## Assets and sound

Demo-owned assets belong in `demos/<id>/assets`; globally reusable public assets belong in `public/images` or `public/audio`. Background image, narration, music, logo, and subtitle paths are reserved in `future` but not rendered yet. Do not add media paths until the corresponding composition and validator support is implemented.
