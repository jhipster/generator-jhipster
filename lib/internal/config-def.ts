import type { JHipsterConfigs } from '../../lib/command/index.js';
import type CoreGenerator from '../../generators/base-core/index.js';
import { upperFirstCamelCase } from '../utils/string.js';

export function loadConfig(this: CoreGenerator, configsDef: JHipsterConfigs | undefined, data: { application: any });
export function loadConfig(configsDef: JHipsterConfigs | undefined, data: { application: any; config?: any });
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
          if (def.scope === 'context') {
            source = (this as CoreGenerator).context!;
          } else if (def.scope === 'blueprint') {
            source = (this as any).blueprintStorage.getAll();
          } else if (def.scope === 'storage' || def.scope === undefined) {
            source = (this as CoreGenerator).jhipsterConfigWithDefaults;
          }
        }

        if (source) {
          value = application[name] = source[name] ?? undefined;
          if (value === undefined && def.default !== undefined) {
            application[name] = typeof def.default === 'function' ? def.default.call(this, source) : def.default;
          }
        }
      }
    }
  }
}

export const loadDerivedConfig = (configsDef: JHipsterConfigs | undefined, { application }) => {
  if (configsDef) {
    for (const [name, def] of Object.entries(configsDef)) {
      if ((def.scope === undefined || ['storage', 'blueprint', 'context'].includes(def.scope)) && def.choices) {
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
