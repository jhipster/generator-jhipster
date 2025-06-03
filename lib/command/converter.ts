import type { JHipsterOptionDefinition } from '../jdl/core/types/parsing.js';
import type {
  CommandConfigDefault,
  CommandConfigScope,
  CommandConfigType,
  ConfigSpec,
  JHipsterArguments,
  JHipsterChoices,
  JHipsterConfigs,
} from './types.js';

type JHipsterArgumentsWithChoices = JHipsterArguments & { choices?: JHipsterChoices };

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

export const convertConfigToOption = <const T extends ConfigSpec<any>>(
  name: string,
  config: T,
):
  | {
      name: string;
      description?: string;
      choices?: string[];
      type?: CommandConfigType;
      scope: CommandConfigScope;
      default?: CommandConfigDefault<any>;
    }
  | undefined => {
  const { cli } = config;
  const type = cli?.type ?? config.internal?.type;
  if (!type && config?.internal) return undefined;

  const choices = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value));
  return {
    ...cli,
    name: cli?.name ?? name,
    default: config.default ?? cli?.default,
    description: config.description ?? cli?.description,
    choices,
    scope: config.scope,
    type,
  };
};
