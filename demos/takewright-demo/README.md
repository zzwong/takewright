# takewright-demo

The dogfood demo: Takewright rendering itself. The tape replays real CLI
transcripts through `fixtures/takewright-replay.mjs` so output is deterministic
and network-free while showing genuine `pnpm demo:doctor`, `demo:render`, and
`demo:validate` commands.

Render with:

```bash
pnpm demo:render takewright-demo --format landscape
pnpm demo:render takewright-demo --format landscape --output gif --skip-recording
```

The GIF embedded in the top-level README lives at `docs/media/takewright-demo.gif`.
After changing this demo, rerender the GIF and copy it there:

```bash
cp output/takewright-demo/takewright-demo-landscape.gif docs/media/takewright-demo.gif
```

If you change transcript content, keep `fixtures/takewright-replay.mjs` in sync
with what the real commands actually print.
