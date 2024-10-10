import type { JHipsterOptionDefinition } from '../jdl/core/types/parsing.js';
import type { ConfigSpec, JHipsterArguments, JHipsterConfigs, JHipsterOption, JHispterChoices } from './types.js';

type JHipsterArgumentsWithChoices = JHipsterArguments & { choices?: JHispterChoices };

export const extractArgumentsFromConfigs = (configs: JHipsterConfigs | undefined): JHipsterArgumentsWithChoices => {
  if (!configs) return {};
  return Object.fromEntries(
    Object.entries(configs)
      .filter(([_name, def]) => def.argument)
      .map(([name, def]) => [
        name,
        {
          description: def.description,
          scope: def.scope,
          choices: def.choices,
          ...def.argument,
        },
      ]),
  ) as JHipsterArgumentsWithChoices;
};

export const extractJdlDefinitionFromCommandConfig = (configs: JHipsterConfigs = {}): JHipsterOptionDefinition[] =>
  Object.entries(configs)
    .filter(([_name, def]) => def.jdl)
    .map(([name, def]) => ({
      ...(def.jdl as Omit<JHipsterOptionDefinition, 'name' | 'knownChoices'>),
      name,
      knownChoices: def.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value)),
    }))
    .sort((a, b) => (b.name.startsWith(a.name) ? 1 : a.name.localeCompare(b.name)));

export const convertConfigToOption = (name: string, config?: ConfigSpec<any>): JHipsterOption | undefined => {
  if (!config?.cli?.type && config?.internal !== true) return undefined;
  const choices = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value)) as any;
  return {
    name,
    description: config.description,
    choices,
    scope: config.scope ?? 'storage',
    type: val => val,
    ...config.cli,
  };
};
