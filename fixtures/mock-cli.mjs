const command = process.argv[2] ?? 'detect';

const outputs = {
  detect: ['◈ Scanning workspace', '✓ TypeScript project detected', '✓ Configuration loaded', '✓ 4 render formats ready'],
  validate: ['◈ Validating example-demo', '✓ tape and captions found', '✓ timing ranges valid', '✓ demo is ready to render'],
};

for (const line of outputs[command] ?? ['Unknown fixture command']) {
  process.stdout.write(`${line}\n`);
}
