import type BaseGenerator from '../../generators/base/generator.ts';
import { buildMutateDataForProperty } from '../utils/derived-property.ts';
import type { MutateDataFunction } from '../utils/object.ts';

import type { JHipsterConfigs } from './index.ts';

export const getCommandDerivedPropertyMutations = (
  configs: JHipsterConfigs,
  options: { scopes?: string[] } = {},
): Record<string, MutateDataFunction> => {
  const scopes = options.scopes ?? ['storage', 'blueprint', 'context'];
  const scopeConfigs = Object.entries(configs).filter(([_key, def]) => scopes.includes(def.scope));
  const mutations: Record<string, MutateDataFunction> = {
    __override__: false as any,
  };
  for (const [key, def] of scopeConfigs) {
    if (def.choices) {
      const array = def.internal?.type === Array;
      const anyCheck =
        array ? undefined : (value: any, choices: any[]) => (typeof value !== 'string' || value === 'no' ? false : choices.includes(value));
      const choiceValues = def.choices.map(choice => (typeof choice === 'object' ? choice.value : choice));
      Object.assign(mutations, buildMutateDataForProperty(key, choiceValues, { array, anyCheck }));
      if (def.internal?.alias) {
        Object.assign(
          mutations,
          { [def.internal.alias]: (context: any) => context[key] },
          buildMutateDataForProperty(key, choiceValues, { array, anyCheck, prefix: def.internal.alias }),
        );
      }
    }
  }
  return mutations;
};

export const getCommandDefaultMutations = (
  configs: JHipsterConfigs,
  options: {
    scopes?: string[];
  } = {},
): Record<string, MutateDataFunction | undefined> => {
  const scopes = options.scopes ?? ['storage', 'blueprint', 'context'];
  const scopeConfigs = Object.entries(configs).filter(([_key, def]) => scopes.includes(def.scope));
  const mutations: Record<string, MutateDataFunction | undefined> = {
    __override__: false as any,
  };
  for (const [key, def] of scopeConfigs) {
    mutations[key] = (context: any, { delayMarker }) => {
      if (delayMarker) {
        return delayMarker;
      }
      return typeof def.default === 'function' ? def.default(context) : def.default;
    };
  }
  return mutations;
};

export const getCommandBlueprintLoadingMutations = (
  blueprintGenerator: BaseGenerator,
  configs: JHipsterConfigs,
): Record<string, MutateDataFunction> => {
  const blueprintScopedConfigs = Object.entries(configs).filter(([_key, def]) => def.scope === 'blueprint');
  const getValue = (key: string) => blueprintGenerator.blueprintStorage!.get(key) ?? undefined;

  const mutations: Record<string, MutateDataFunction> = {
    __override__: false as any,
  };
  for (const [key] of blueprintScopedConfigs) {
    mutations[key] = () => getValue(key);
  }
  return mutations;
};
