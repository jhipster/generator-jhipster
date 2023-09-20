import type { JHipsterConfigs } from '../../generators/base/api.mjs';
import { upperFirstCamelCase } from '../../generators/base/support/string.mjs';

export const convertConfigToOption = (name, config) => {
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
      application[name] = config[name];
    }
  }
};

export const loadDerivedConfig = (configsDef: JHipsterConfigs | undefined, { application }) => {
  if (configsDef) {
    for (const [name, def] of Object.entries(configsDef)) {
      if (def.choices) {
        for (const choice of def.choices) {
          const choiceVal = typeof choice === 'string' ? choice : choice.value;
          const value = application[name];
          application[`${name}${upperFirstCamelCase(choiceVal)}`] = (value ?? 'no') === choiceVal;
        }
        application[`${name}Any`] = !application[`${name}No`];
      }
    }
  }
};
