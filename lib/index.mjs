import { readFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

export * from '../cli/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getPackageRoot = relativePath => {
  const sourceRoot = join(__dirname, '..');
  const sourceBasename = basename(sourceRoot);
  const packageDirectory = sourceBasename === 'generator-jhipster' ? sourceRoot : join(sourceRoot, '..');
  return relativePath ? join(packageDirectory, relativePath) : packageDirectory;
};

export const packageJson = JSON.parse(readFileSync(fileURLToPath(new URL(getPackageRoot('package.json'), import.meta.url))));
