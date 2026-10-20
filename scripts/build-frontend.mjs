import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
// Builds frontend/ when it exists. shell: true lets Windows find pnpm.cmd (Node 20.12+ refuses to spawn .cmd files without a shell).
if (existsSync('frontend/package.json')) {
  const result = spawnSync('pnpm', ['--dir', 'frontend', 'build'], { stdio: 'inherit', shell: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('Frontend validation/build failed.');
}
