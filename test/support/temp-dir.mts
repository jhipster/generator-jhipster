import crypto from 'crypto';
import path, { dirname } from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getPackageFilePath = (...filePath: string[]) => path.resolve(__dirname, '../..', ...filePath);

function _prepareTempEnv() {
  const cwd = process.cwd();
  const tempDir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));
  process.chdir(os.tmpdir());
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });
  process.chdir(tempDir);
  return { cwd, tempDir: process.cwd() };
}

export function testInTempDir(cb: (tempDir: string) => any): string | Promise<string> {
  const preparedEnv = _prepareTempEnv();
  const cwd = preparedEnv.cwd;
  const cbReturn = cb(preparedEnv.tempDir);
  if (cbReturn instanceof Promise) {
    return cbReturn.then(() => {
      return cwd;
    });
  }
  return cwd;
}

export function revertTempDir(dest: string = getPackageFilePath(), tempDir?: string) {
  if (tempDir === undefined) {
    const cwd = process.cwd();
    if (cwd.includes(os.tmpdir())) {
      tempDir = cwd;
    }
  }
  process.chdir(dest);
  if (tempDir && dest !== tempDir) {
    fs.rmSync(tempDir, { recursive: true });
  }
}
