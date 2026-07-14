---
name: takewright
description: Create, render, inspect, and refine deterministic terminal demo videos with the Takewright VHS/Remotion pipeline. Use when asked to make a CLI demo, terminal recording, Slack demo video, landscape terminal video, social video variant, VHS tape, captions, zoom, callout, or to diagnose visual problems in generated demo media.
---

# Takewright

Operate the text-driven pipeline in the repository containing this skill. Resolve the project root as two directories above this file. Keep authored inputs under `demos/<id>/`, raw VHS recordings under `public/recordings/`, and final media under `output/`.

## Create a demo

1. Run `pnpm demo:doctor` when the environment has not been checked.
2. For Slack, default to `pnpm demo:new <id> --preset slack-landscape` unless the user requests another format.
3. Reject IDs that are not lowercase kebab-case. Never overwrite an existing demo.
4. Edit `demo.tape` for terminal actions, `demo.json` for composition and timing, and `captions.json` for captions.
5. Read `docs/slack-landscape-quickstart.md` when authoring a Slack demo or explaining the workflow. Read `docs/demo-authoring.md` for zoom, callout, caption, and timing details.

## Author the tape

- Keep `Output public/recordings/<id>.mp4` aligned with the directory ID.
- Run commands from the project root; use a hidden `cd` when demonstrating a neighboring CLI repository.
- Put setup/build steps between `Hide` and `Show`.
- Set locale, timezone, shell, dimensions, font, and cursor behavior explicitly.
- Prefer deterministic fixtures and stable output. Never place credentials in a tape.
- Use restrained waits: enough to read output, without long dead time.

## Render and review

1. Run `pnpm demo:render <id> --format landscape` after tape changes.
   Use `--output gif` when the requested final deliverable is a GIF; do not add a manual conversion step.
2. Use `--skip-recording` only when the tape and CLI output are unchanged.
3. Run `pnpm demo:inspect <id> --format landscape`.
   Include `--output gif` when reviewing a GIF render.
4. Read `output/<id>/inspection/manifest.json` and inspect the contact sheet plus each zoom/callout frame.
5. Correct clipped text, side bars, unreadable scale, captions covering commands, poor zoom targets, dead time, or inconsistent framing.
6. Rerender until `pnpm demo:validate <id> --all` and `pnpm check` pass.

For Slack landscape demos, preserve the preset's compact 1200×700 recording, 25px terminal font, `terminalScale` of 0.72, and landscape-only format unless the content needs a deliberate exception. Zooms must keep the complete command being discussed visible.

Do not use a GUI editor or computer-use automation for editing. Optional playback may be used only as a final check.
