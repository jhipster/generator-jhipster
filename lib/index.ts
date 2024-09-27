import { readFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const isDistFolder = () => {
  return basename(dirname(__dirname)) === 'dist';
};

export const getPackageRoot = (relativePath?: string) => {
  const sourceRoot = dirname(__dirname);
  const packageDirectory = isDistFolder() ? dirname(sourceRoot) : sourceRoot;
  return relativePath ? join(packageDirectory, relativePath) : packageDirectory;
};

export const getSourceRoot = (relativePath?: string) => {
  const sourceRoot = dirname(__dirname);
  return relativePath ? join(sourceRoot, relativePath) : sourceRoot;
};

export const packageJson = JSON.parse(readFileSync(getPackageRoot('package.json')).toString());
