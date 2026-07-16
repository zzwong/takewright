# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Vitest test suite covering the demo schema, CLI argument parsing, demo loading, media probing, validation rules, format presets, and `demo:new` scaffolding. `pnpm check` now runs it.
- A dogfooding demo (`demos/takewright-demo`) that renders Takewright rendering itself; its GIF is embedded in the README.

### Fixed
- `demo:doctor` now finds JetBrains Mono in user font directories (`~/.local/share/fonts`, `~/.fonts`) and falls back to fontconfig on Linux.
- A bare `--format` flag with no value now reports an error instead of being silently ignored.

## [0.1.0] - 2026-02-10

### Added
- Initial release: VHS recording, Remotion composition, FFmpeg validation and inspection, four format presets (landscape, portrait, square, social portrait), MP4 and GIF outputs, deterministic example demo, doctor and smoke tooling, CI workflow, and the Codex skill.
