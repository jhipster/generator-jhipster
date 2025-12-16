import { lookupGeneratorsWithNamespace } from '../../../lib/utils/index.ts';

let generatorNamespaces: string[] | undefined;

export const lookupGeneratorsNamespaces = (): string[] => {
  if (!generatorNamespaces) {
    generatorNamespaces = lookupGeneratorsWithNamespace()
      .map(({ namespace }) => namespace)
      .sort();
  }

  return generatorNamespaces!;
};
