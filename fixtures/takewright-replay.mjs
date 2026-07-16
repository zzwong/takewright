// Deterministic replay of real Takewright CLI output for the dogfood demo.
// The tape defines `pnpm` as a shell function that routes here, so the video
// shows genuine command lines and genuine output without network or timing
// variance. Keep these transcripts in sync with the real commands.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const transcripts = {
  'demo:doctor': [
    '✓ node: v22.14.0',
    '✓ pnpm: 11.10.0',
    '✓ terminal recorder: native VHS (vhs version 0.11.0)',
    '✓ ffmpeg: ffmpeg version 7.1',
    '✓ ffprobe: ffprobe version 7.1',
    '✓ output directory: writable',
    '✓ JetBrains Mono font: /usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf',
    '✓ Remotion render: trivial frame rendered',
  ],
  'demo:render': [
    '◈ Validating takewright-demo configuration',
    '◈ Recording terminal with VHS',
    '◈ Probing raw recording: 1200x700, 30 fps',
    '◈ Rendering Remotion composition TerminalDemo-landscape',
    '✓ output/takewright-demo/takewright-demo-landscape.mp4 (1920x1080, 14.20s, h264)',
  ],
  'demo:validate': [
    '✓ takewright-demo configuration and source files are valid.',
  ],
};

const lines = transcripts[process.argv[2]] ?? [`Unknown replay command: ${process.argv[2] ?? ''}`];
for (const line of lines) {
  process.stdout.write(`${line}\n`);
  await sleep(140);
}
