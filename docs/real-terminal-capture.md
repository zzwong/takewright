# Optional real-terminal capture

This mode is a secondary design, not a dependency of the VHS pipeline. Use it only when a real Ghostty feature must be visible.

## Controlled launch

Create a dedicated temporary HOME containing a minimal Ghostty configuration: fixed font family/size, theme, padding, window size, no shell integration, and no inherited user config. Launch Ghostty with its supported config-file option and a command that attaches to a uniquely named tmux socket/session. Start tmux with a clean environment and a shell invoked with `--noprofile --norc`.

## Driving the demo

Prepare a shell script containing deterministic fixture commands. Use `tmux send-keys -t <session> -l -- <text>` followed by a separate `tmux send-keys ... Enter`; never simulate visual keyboard input. Synchronize stages with `tmux wait-for`, pane capture, or known output markers instead of arbitrary focus-dependent delays.

## Focus and capture region

Prefer capture APIs that select a window by stable process/window identity. On macOS, enumerate the Ghostty window through CoreGraphics and pass its bounds to an FFmpeg/AVFoundation or ScreenCaptureKit wrapper; on Linux, use compositor-native window capture where available. If OBS is required, create a dedicated scene containing one window-capture source and control recording through OBS WebSocket. Determine and verify the region before recording by taking a still and checking its dimensions.

## Run lifecycle

1. Remove any stale named tmux session and temporary profile.
2. Create the clean HOME, socket, session, and fixture state.
3. Launch Ghostty and wait until the expected pane marker appears.
4. Resolve the intended window and bounds; abort if there is not exactly one match.
5. Start native or OBS recording and wait for an explicit recording-state acknowledgement.
6. Send commands through tmux and wait for markers.
7. Stop recording through the API and confirm the file is closed and non-zero.
8. Terminate the tmux session and Ghostty process; remove temporary state.
9. Normalize with FFmpeg to H.264, yuv420p, 30 fps, even dimensions, and a stable start time.
10. Write the normalized file to `public/recordings/<id>.mp4`, then use the normal Remotion pipeline with `--skip-recording`.

## Recovery

Every run uses unique names and a trap/finally cleanup routine. On failure, stop an active recorder first, preserve raw media and logs under `output/<id>/capture-debug/`, kill only processes carrying the run identifier, and leave the standard recording untouched. A later run starts from a fresh tmux socket and profile.

## Nondeterminism

Window-manager placement, display scaling, font rasterization, compositor timing, notification overlays, focus policy, capture permission prompts, GPU rendering, and application startup remain variable. Pre-grant capture permissions in CI-like hosts, use a dedicated display/workspace, disable notifications, and verify a preflight still. VHS remains preferable whenever the content can be represented in its terminal renderer.
