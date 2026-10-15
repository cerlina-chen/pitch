import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
// The frontend is being rebuilt. Until frontend/ exists, backend builds and tests run without it.
if (existsSync('frontend/package.json')) {
  const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['--dir', 'frontend', 'build'], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Frontend validation/build failed.');
}
