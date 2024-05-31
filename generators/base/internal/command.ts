import { JHipsterArguments, JHipsterConfigs } from '../api.js';

export const extractArgumentsFromConfigs = (configs: JHipsterConfigs | undefined): JHipsterArguments => {
  if (!configs) return {};
  return Object.fromEntries(
    Object.entries(configs)
      .filter(([_name, def]) => def.argument)
      .map(([name, def]) => [
        name,
        {
          description: def.description,
          ...def.argument,
        },
      ]),
  ) as JHipsterArguments;
};
