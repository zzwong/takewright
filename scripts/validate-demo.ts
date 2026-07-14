#!/usr/bin/env node
import {formatFromArgs, loadDemo, fail} from './shared';
import {validateDemo} from './validate-lib';

const main = async () => {
  const id = process.argv[2];
  if (!id) throw new Error('Usage: pnpm demo:validate <demo-id> [--format <name> | --all]');
  const {config, captions} = await loadDemo(id);
  const {formats, outputType} = formatFromArgs(process.argv.slice(3), config.formats);
  const result = await validateDemo(config, captions, formats, {requireRecording: true, outputType});
  console.log(`✓ ${id} configuration and source files are valid.`);
  for (const warning of result.warnings) console.warn(`Warning: ${warning}`);
};
main().catch(fail);
