import { basename, dirname, join } from 'node:path';

import { globSync } from 'tinyglobby';

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

let generatorNamespaces: string[] | undefined;

export const getGeneratorNamespaces = (): string[] => {
  if (!generatorNamespaces) {
    const sourceRoot = getSourceRoot();
    const generators = globSync([`generators/*/index.{t,j}s`, `generators/*/generators/*/index.{t,j}s`], {
      onlyFiles: true,
      cwd: sourceRoot,
    });
    generatorNamespaces = generators
      .map(gen =>
        gen
          .replace(/\/index\.(t|j)s$/, '')
          .replace(/generators\//g, '')
          .replaceAll('/', ':'),
      )
      .sort();
  }

  return generatorNamespaces!;
};

export { packageJson };
