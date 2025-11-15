import { basename, dirname, join } from 'node:path';

import packageJson from '../package.json' with { type: 'json' };

export const isDistFolder = () => basename(dirname(import.meta.dirname)) === 'dist';

export const getPackageRoot = (relativePath?: string) => {
  const sourceRoot = dirname(import.meta.dirname);
  const packageDirectory = isDistFolder() ? dirname(sourceRoot) : sourceRoot;
  return relativePath ? join(packageDirectory, relativePath) : packageDirectory;
};

export const getSourceRoot = (relativePath?: string) => {
  const sourceRoot = dirname(import.meta.dirname);
  return relativePath ? join(sourceRoot, relativePath) : sourceRoot;
};

export { packageJson };
