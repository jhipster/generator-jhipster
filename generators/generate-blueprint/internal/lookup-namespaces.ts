import { globSync } from 'tinyglobby';

import { getSourceRoot } from '../../../lib/index.ts';

let generatorNamespaces: string[] | undefined;

export const lookupGeneratorsNamespaces = (): string[] => {
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
