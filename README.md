# Takewright

Takewright turns deterministic terminal scripts into polished, multi-format videos without a GUI timeline. VHS records a controlled terminal, Remotion supplies the stage and motion, and FFmpeg/FFprobe validate and inspect the media. Every editable source is code, JSON, or Markdown.

The project is intentionally marked `private` in `package.json` to prevent accidental npm publication. That does not restrict cloning, modification, or redistribution under the project license.

## Prerequisites

- Node.js 22 or newer
- pnpm 11 (Corepack is fine)
- FFmpeg and FFprobe
- VHS 0.11 or newer; Docker is an automatic render fallback when native VHS is absent
- JetBrains Mono (open source). The official VHS action provides it in CI.

macOS setup:

```bash
brew install ffmpeg vhs
brew install --cask font-jetbrains-mono
corepack enable
pnpm install
pnpm demo:doctor
```

VHS itself requires `ttyd` and FFmpeg; the Homebrew formula installs `ttyd`. No proprietary fonts or raster backgrounds are checked in.

For other platforms, install Node.js and pnpm using their standard installers, then follow the official installation instructions for [VHS](https://github.com/charmbracelet/vhs) and [FFmpeg](https://ffmpeg.org/download.html).

## Five-minute example

```bash
pnpm install
pnpm demo:doctor
pnpm demo:render example-demo --format landscape
pnpm demo:inspect example-demo --format landscape
open output/example-demo/inspection/contact-sheet.png # optional local viewing
```

The render command validates the JSON, runs VHS, probes the recording, computes duration, renders Remotion, probes the result, and prints the final path.

For a compact landscape video intended for Slack, use the copy-paste [Slack landscape quickstart](docs/slack-landscape-quickstart.md):

```bash
pnpm demo:new my-cli-demo --preset slack-landscape
```

## Commands

```bash
pnpm demo:new account-import
pnpm demo:render account-import
pnpm demo:render account-import --format portrait
pnpm demo:render account-import --format landscape --output gif
pnpm demo:render account-import --all
pnpm demo:render account-import --all --skip-recording
pnpm demo:inspect account-import --format landscape
pnpm demo:inspect account-import --format landscape --output gif
pnpm demo:validate account-import --all
pnpm demo:doctor
pnpm check
```

`demo:new` accepts lowercase kebab-case IDs and never overwrites a directory. A normal render defaults to the first configured format and MP4 output. `--output gif` natively renders an infinitely looping, approximately 15 fps GIF at two-thirds scale (1280×720 for landscape), which keeps Slack uploads practical. `--skip-recording` reuses `public/recordings/<id>.mp4`; it fails if that recording is absent. `--smoke` is intended for CI and renders 25% scale for at most 90 frames.

## Demo layout

Each directory under `demos/` owns its inputs:

```text
demos/my-demo/
├── demo.tape       # terminal actions and raw output path
├── demo.json       # title, visual settings, formats, zooms, callouts
├── captions.json   # frame-based captions
├── README.md       # demo-specific notes
└── assets/         # optional demo-owned assets
```

Generated assets are deliberately separate:

- `public/recordings/<id>.mp4`: raw VHS media consumed by Remotion
- `output/<id>/<id>-<format>.mp4`: final videos
- `output/<id>/<id>-<format>.gif`: final GIFs requested with `--output gif`
- `output/<id>/inspection/`: extracted frames, contact sheet, and `manifest.json`

The four presets are landscape (1920×1080), portrait (1080×1920), square (1080×1080), and social portrait (1080×1350). Portrait layouts narrow and reposition the terminal inside portrait safe areas instead of cropping a landscape composition.

## Editing

Use `demo.tape` for shell activity and pauses. Keep all commands network-free or fixture-backed when reproducibility matters. Use frame numbers in `captions.json`, `zooms`, and `callouts`; the project renders at 30 fps. See [demo authoring](docs/demo-authoring.md) for field details.

Composition primitives live under `src/`: CSS/SVG-style backgrounds, the terminal frame, overlays, theme tokens, and format presets. Change JSON first for demo-specific adjustments; change components only for reusable visual behavior.

## Inspection and validation

`demo:inspect` samples the intro, first command, every zoom and callout, midpoint, final command, and outro. It writes a contact sheet plus a machine-readable manifest containing timestamps, reasons, media metadata, and boolean checks. The [agent guide](AGENTS.md) defines the autonomous review loop.

`demo:validate` checks JSON schemas, IDs, required files, range direction and overlap, short captions, media readability, zero-byte files, raw dimensions, declared bounds, output dimensions, and subprocess exit codes. Shell commands are executed with structured argument arrays through Execa.

## Troubleshooting

- **VHS reports `ttyd` connection refused:** confirm `ttyd --version`, stop a stale `ttyd` process, and rerun. The render is safe to repeat.
- **VHS is missing:** install it with `brew install vhs`, or start Docker so the renderer can use `ghcr.io/charmbracelet/vhs`.
- **Tape output path is wrong:** its `Output` must be `public/recordings/<demo-id>.mp4`.
- **Raw dimensions differ:** make `Set Width`/`Set Height` agree with `demo.json`.
- **Remotion version mismatch:** keep all Remotion packages and Zod pinned exactly as in `package.json`, then run `pnpm install`.
- **Chrome cannot render:** rerun `pnpm demo:doctor`; Remotion provisions its supported browser on demand.
- **Caption or zoom is out of bounds:** render the recording, inspect its probed duration, then move the ending frame earlier.
- **A render command fails silently:** the wrapper reports the failed step, full command, stderr, and a corrective action. VHS commands should themselves use `set -e` or deterministic fixture programs when multiple shell operations are involved.

## CI

`.github/workflows/smoke.yml` uses read-only permissions and commit-pinned actions. It installs Node, pnpm, FFmpeg, and VHS; caches pnpm's store; checks types and lint; audits production dependencies; records and validates the example; renders low-resolution MP4 and GIF smoke artifacts; and uploads them. Full-resolution variants are intentionally not rendered on every commit.

## Optional real terminal capture

VHS is the default. A secondary tmux-driven Ghostty/OBS or native-capture design is documented in [real terminal capture](docs/real-terminal-capture.md). It retains Remotion as the compositor and does not rely on visual keyboard simulation.

## Codex skill

The checked-in [Takewright skill](skills/takewright/SKILL.md) teaches Codex how to create, render, inspect, and refine demos, with Slack landscape as the default social workflow. Install it into your personal skill catalog from the repository root:

```bash
mkdir -p ~/.codex/skills
ln -sfn "$(pwd)/skills/takewright" ~/.codex/skills/takewright
```

Then invoke it with `$takewright` or ask Codex to create a terminal or Slack demo.

## Architecture

See [architecture](docs/architecture.md) for data flow, determinism boundaries, and extension points.

## Contributing and support

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Use GitHub Issues for reproducible bugs and focused feature requests, and follow the [Code of Conduct](CODE_OF_CONDUCT.md). General usage guidance is in [SUPPORT.md](SUPPORT.md); security issues must follow [SECURITY.md](SECURITY.md).

Maintainers preparing a public repository should follow the [maintainer guide](docs/maintainer-guide.md).

## License

Takewright source code is available under the [MIT License](LICENSE). Dependencies and external tools retain their own licenses. In particular, Remotion uses the Remotion License and may require a company license depending on the user or organization. Review [NOTICE.md](NOTICE.md) before adopting or redistributing the project.
