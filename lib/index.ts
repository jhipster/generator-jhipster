import { readFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const isDistFolder = () => {
  return basename(join(__dirname, '..')) === 'dist';
};

export const getPackageRoot = (relativePath?: string) => {
  const sourceRoot = join(__dirname, '..');
  const packageDirectory = isDistFolder() ? join(sourceRoot, '..') : sourceRoot;
  return relativePath ? join(packageDirectory, relativePath) : packageDirectory;
};

// eslint-disable-next-line import/prefer-default-export
export const packageJson = JSON.parse(readFileSync(getPackageRoot('package.json')).toString());
