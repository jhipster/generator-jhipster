import type { ConfigSpec, JHipsterConfigs, JHipsterOption } from '../../generators/base/api.js';
import type CoreGenerator from '../../generators/base-core/index.js';
import { upperFirstCamelCase } from '../../generators/base/support/string.js';

export const convertConfigToOption = (name: string, config?: ConfigSpec): JHipsterOption | undefined => {
  if (!config?.cli?.type) return undefined;
  const choices = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value)) as any;
  return {
    name,
    description: config.description,
    choices,
    scope: config.scope ?? 'storage',
    ...config.cli,
  };
};

export function loadConfig(
  this: CoreGenerator | void,
  configsDef: JHipsterConfigs | undefined,
  { application, config }: { application: any; config?: any },
) {
  if (configsDef) {
    for (const [name, def] of Object.entries(configsDef)) {
      let value = application[name];
      if (value === undefined || value === null) {
        let source = config;
        if (!source) {
          if (def.scope === 'generator') {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            source = this;
          } else if (def.scope === 'blueprint') {
            source = (this as any).blueprintStorage.getAll();
          } else {
            source = (this as any).jhipsterConfigWithDefaults;
          }
        }

        value = application[name] = source[name] ?? undefined;
        if (value === undefined && def.default !== undefined) {
          application[name] = typeof def.default === 'function' ? def.default.call(this, source) : def.default;
        }
      }
    }
  }
}

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
