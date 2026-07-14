# Slack landscape quickstart

This is the shortest supported workflow for a compact landscape CLI demo suitable for posting to Slack.

## Create the demo

```bash
cd ~/dev/takewright
export DEMO_ID="my-cli-demo"

pnpm install
pnpm demo:doctor
pnpm demo:new "$DEMO_ID" --preset slack-landscape
```

The preset creates a 1200×700 terminal with a 25px font, a compact terminal frame, and landscape-only output. The final MP4 remains 1920×1080.

## Author the terminal session

```bash
${EDITOR:-nano} "demos/$DEMO_ID/demo.tape"
```

Keep the generated settings and replace the example action with your commands. Commands run from `~/dev/takewright`, so use a hidden setup block for a neighboring repository:

```text
Hide
Type "cd ../your-cli-project && clear"
Enter
Sleep 500ms
Show

Sleep 1s
Type "your-cli inspect ./example"
Sleep 500ms
Enter
Sleep 3s

Type "clear"
Enter
Sleep 700ms

Type "your-cli run ./example"
Sleep 500ms
Enter
Sleep 4s
```

Keep the tape's output line synchronized with the demo ID:

```text
Output public/recordings/my-cli-demo.mp4
```

Put builds, fixture creation, and other non-demo setup between `Hide` and `Show`. Do not include credentials, personal shell startup files, unstable timestamps, or network-dependent output unless those are deliberately part of the demonstration.

## Set titles and captions

Edit the presentation metadata:

```bash
${EDITOR:-nano} "demos/$DEMO_ID/demo.json"
${EDITOR:-nano} "demos/$DEMO_ID/captions.json"
```

Use a short title and optional subtitle. Captions are frame-based at 30 fps. Leave `captions.json` as `[]` when captions are unnecessary. Omit zooms initially; add one only when it improves legibility, and ensure the entire highlighted command remains visible.

## Render and inspect

```bash
pnpm demo:render "$DEMO_ID" --format landscape
pnpm demo:inspect "$DEMO_ID" --format landscape

open "output/$DEMO_ID/inspection/contact-sheet.png"
open "output/$DEMO_ID/$DEMO_ID-landscape.mp4"
```

The Slack-ready file is:

```text
output/<demo-id>/<demo-id>-landscape.mp4
```

To render a native, infinitely looping 1280×720 GIF at approximately 15 fps instead of a final MP4:

```bash
pnpm demo:render "$DEMO_ID" --format landscape --output gif
pnpm demo:inspect "$DEMO_ID" --format landscape --output gif

open "output/$DEMO_ID/$DEMO_ID-landscape.gif"
```

The GIF is written directly by Remotion; no manual MP4-to-GIF conversion is required. The raw VHS recording remains an internal MP4 source.

Review for side bars, clipped commands, tiny terminal text, captions covering output, poor zoom targets, and long pauses.

## Iterate

Rerecord after changing commands:

```bash
pnpm demo:render "$DEMO_ID" --format landscape
```

Reuse the recording after changing only composition, captions, callouts, or zooms:

```bash
pnpm demo:render "$DEMO_ID" --format landscape --skip-recording
```

Finish with:

```bash
pnpm demo:inspect "$DEMO_ID" --format landscape
pnpm demo:validate "$DEMO_ID" --all
```

When the final deliverable is a GIF, validate it explicitly:

```bash
pnpm demo:validate "$DEMO_ID" --all --output gif
```
