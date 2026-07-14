#!/usr/bin/env node
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {CliError, exists, fail, root, writeJson} from './shared';

const main = async () => {
  const id = process.argv[2];
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new CliError('Demo ID must be lowercase kebab-case.', 'Example: pnpm demo:new account-import');
  const presetIndex = process.argv.indexOf('--preset');
  const preset = presetIndex >= 0 ? process.argv[presetIndex + 1] : undefined;
  if (presetIndex >= 0 && preset !== 'slack-landscape') throw new CliError(`Unknown preset "${preset ?? ''}".`, 'Use "--preset slack-landscape" or omit --preset.');
  const slackLandscape = preset === 'slack-landscape';
  const width = slackLandscape ? 1200 : 1440;
  const height = slackLandscape ? 700 : 900;
  const fontSize = slackLandscape ? 25 : 28;
  const dir = path.join(root, 'demos', id);
  if (await exists(dir)) throw new CliError(`Demo "${id}" already exists.`, 'Choose a new ID; existing demos are never overwritten.');
  await mkdir(path.join(dir, 'assets'), {recursive: true});
  await writeJson(path.join(dir, 'demo.json'), {
    id,
    title: id.split('-').map((word) => word[0]!.toUpperCase() + word.slice(1)).join(' '),
    recording: {tape: 'demo.tape', width, height},
    ...(slackLandscape ? {composition: {theme: 'ghostty-dark', background: 'gradient', terminalScale: 0.72, terminalPositionY: 0.05, showWindowChrome: true, cornerRadius: 18, shadow: true}} : {}),
    formats: slackLandscape ? ['landscape'] : ['landscape', 'portrait', 'square', 'social-portrait'],
    captions: 'captions.json',
  });
  await writeJson(path.join(dir, 'captions.json'), []);
  await writeFile(path.join(dir, 'demo.tape'), `Output public/recordings/${id}.mp4\nSet Shell "bash"\nSet Width ${width}\nSet Height ${height}\nSet FontSize ${fontSize}\nSet FontFamily "JetBrains Mono"\nSet Framerate 30\nSet TypingSpeed 45ms\nSet Padding 28\nSet Margin 0\nSet CursorBlink false\n\nEnv LANG "C"\nEnv LC_ALL "C"\nEnv TZ "UTC"\nEnv NO_COLOR "1"\nEnv BASH_ENV "/dev/null"\n\nHide\nType "clear"\nEnter\nSleep 500ms\nShow\nSleep 1s\nType "printf 'Hello from ${id}\\\\n'"\nEnter\nSleep 3s\n`);
  await writeFile(path.join(dir, 'README.md'), `# ${id}\n\nEdit \`demo.tape\`, \`demo.json\`, and \`captions.json\`. Render with \`pnpm demo:render ${id} --format landscape\`.\n`);
  console.log(`✓ Created demos/${id}`);
};
main().catch(fail);
