# Contributing

Thank you for helping improve Takewright.

## Before starting

- Search existing issues before opening a new one.
- Open an issue before undertaking a large feature or architectural change.
- Keep contributions focused and avoid committing generated recordings or final media.
- Never include credentials, private URLs, proprietary fonts, or confidential terminal output in demos.

## Local setup

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm demo:doctor
```

See the README for system prerequisites. Use Node.js 22 or newer and pnpm 11 or newer.

## Development workflow

1. Create a branch from `main`.
2. Make the smallest cohesive change.
3. Add or update documentation when behavior changes.
4. Run the required checks:

```bash
pnpm check
pnpm audit --prod --audit-level high
```

For rendering changes, also run:

```bash
pnpm demo:render example-demo --format landscape
pnpm demo:render example-demo --format landscape --output gif --skip-recording
pnpm demo:inspect example-demo --format landscape
pnpm demo:inspect example-demo --format landscape --output gif
pnpm demo:validate example-demo --format landscape
pnpm demo:validate example-demo --format landscape --output gif
```

## Pull requests

Explain what changed, why it changed, how it was verified, and any scope limitations. Keep generated files out of the diff. By contributing, you agree that your contribution is licensed under the project's MIT License.

All contributors must follow the [Code of Conduct](CODE_OF_CONDUCT.md).
