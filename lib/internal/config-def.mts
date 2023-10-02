import type { JHipsterConfigs } from '../../generators/base/api.mjs';
import { upperFirstCamelCase } from '../../generators/base/support/string.mjs';

export const convertConfigToOption = (name, config) => {
  if (!config?.cli?.type) return undefined;
  const choices = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value));
  return {
    name,
    description: config.description,
    choices,
    scope: 'storage',
    ...config.cli,
  };
};

export const loadConfig = (configsDef, { application, config }) => {
  if (configsDef) {
    for (const [name] of Object.entries(configsDef)) {
      const value = application[name];
      if (value === undefined || value === null) {
        application[name] = config[name] ?? undefined;
      }
    }
  }
};

export const loadDerivedConfig = (configsDef: JHipsterConfigs | undefined, { application }) => {
  if (configsDef) {
    for (const [name, def] of Object.entries(configsDef)) {
      if (def.choices) {
        const configVal = application[name];
        for (const choice of def.choices) {
          const choiceVal = typeof choice === 'string' ? choice : choice.value;
          const prop = `${name}${upperFirstCamelCase(choiceVal)}`;
          application[prop] = application[prop] ?? ([].concat(configVal) as any).includes(choiceVal);
        }
        application[`${name}Any`] = application[`${name}Any`] ?? !application[`${name}No`];
      }
    }
  }
};
