import { relative } from 'node:path';

import { getSourceRoot } from '../../lib/index.ts';

export const getGeneratorNamespace = (diname: string) => {
  return relative(getSourceRoot(), diname).replaceAll('generators/', '').replaceAll('/', ':');
};
