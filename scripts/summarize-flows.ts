import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const flowFile = process.argv[2];

if (!flowFile) {
  console.error('Usage: pnpm summarize-flows <flow-file>');
  process.exit(1);
}

const flowPath = resolve(process.cwd(), flowFile);

if (!existsSync(flowPath)) {
  console.error(`Error: File not found: ${flowPath}`);
  process.exit(1);
}

const outputPath = `${flowFile}.summary.json`;
const scriptPath = resolve(process.cwd(), 'scripts/flow_extractor.py');

console.log(`Summarizing flows from ${basename(flowPath)}...`);

try {
  execSync(`mitmdump -nr "${flowPath}" -s "${scriptPath}"`, {
    env: {
      ...process.env,
      SUMMARY_OUTPUT_PATH: outputPath
    },
    stdio: 'inherit'
  });

  console.log(`\nSuccess! Summary written to: ${outputPath}`);
} catch (error) {
  console.error('\nError running mitmdump:', error.message);
  process.exit(1);
}
