# Autonomous demo workflow

Work only from checked-in tape, JSON, TypeScript, and documentation. Do not edit video with a GUI or use computer-use automation to manipulate a timeline.

For each iteration:

1. Run `pnpm demo:doctor` once per environment.
2. Run `pnpm demo:render <id> --format landscape` (or `--skip-recording` when the tape is unchanged).
3. Run `pnpm demo:inspect <id> --format landscape`.
4. Read `output/<id>/inspection/manifest.json`, then visually inspect every extracted frame and `contact-sheet.png`.
5. Look for clipped output, tiny text, excessive empty space, weak contrast, captions covering commands, incorrect zoom targets, rushed timing, dead time, and inconsistent framing.
6. Modify the tape for terminal content/timing or `demo.json`/`captions.json` for composition timing.
7. Rerender and repeat until `pnpm demo:validate <id> --all` passes and the frames form a coherent story.
8. Render the remaining formats and inspect portrait separately because its safe area and reframing differ.

When the requested deliverable is GIF, add `--output gif` consistently to render, inspect, and validate commands. This uses Remotion's native GIF codec at approximately 15 fps and a Slack-friendly output scale.

Keep commands deterministic: use fixtures, fixed locale/timezone, a controlled shell, and no personal aliases or startup files. Never put credentials in a tape. Do not add proprietary fonts. Computer-use automation is permitted only as an optional final playback check, never as an editing dependency.
