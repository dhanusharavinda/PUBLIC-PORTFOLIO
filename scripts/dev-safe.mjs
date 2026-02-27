import { spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const lockPath = path.join(projectRoot, '.next', 'dev', 'lock');

function normalize(text) {
  return text.replace(/\\/g, '/').toLowerCase();
}

function getProcessList() {
  try {
    if (process.platform === 'win32') {
      const stdout = execSync(
        'powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq \'node.exe\' } | Select-Object -ExpandProperty CommandLine"',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      );
      return stdout.split(/\r?\n/).filter(Boolean);
    }

    const stdout = execSync('ps -ax -o command=', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return stdout.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function hasRunningNextDevInProject() {
  const normalizedRoot = normalize(projectRoot);
  const processes = getProcessList();
  return processes.some((cmd) => {
    const normalizedCmd = normalize(cmd);
    return normalizedCmd.includes('next') && normalizedCmd.includes('dev') && normalizedCmd.includes(normalizedRoot);
  });
}

async function detectRunningPort() {
  for (let port = 3000; port <= 3010; port += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 400);
      const response = await fetch(`http://localhost:${port}`, {
        signal: controller.signal,
        redirect: 'manual',
      });
      clearTimeout(timeout);

      const poweredBy = (response.headers.get('x-powered-by') || '').toLowerCase();
      if (poweredBy.includes('next')) {
        return port;
      }
    } catch {
      // Try the next port.
    }
  }

  return null;
}

async function main() {
  if (existsSync(lockPath)) {
    const hasLiveDev = hasRunningNextDevInProject();
    if (hasLiveDev) {
      const runningPort = await detectRunningPort();
      if (runningPort) {
        console.log(`A dev server is already running at http://localhost:${runningPort}. Reusing existing instance.`);
      } else {
        console.log('A dev server is already running for this project. Reusing existing instance.');
      }
      process.exit(0);
    }

    try {
      rmSync(lockPath, { force: true });
      console.log('Removed stale dev lock and starting a fresh server...');
    } catch {
      // Continue; Next.js will still try to start.
    }
  }

  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main();
