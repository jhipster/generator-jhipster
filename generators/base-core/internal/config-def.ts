import type { CommandConfigScope, JHipsterConfigs } from '../../../lib/command/index.ts';
import { applyDerivedProperty } from '../../../lib/utils/derived-property.ts';
import type CoreGenerator from '../index.ts';

export function loadConfig(this: CoreGenerator, configsDef: JHipsterConfigs | undefined, data: { application: any }): void;
export function loadConfig(configsDef: JHipsterConfigs | undefined, data: { application: any; config?: any }): void;
export function loadConfig(
  this: CoreGenerator | void,
  configsDef: JHipsterConfigs | undefined,
  { application, config }: { application: any; config?: any },
): void {
  if (configsDef) {
    for (const [name, def] of Object.entries(configsDef)) {
      let value = application[name];
      if (value === undefined || value === null) {
        let source = config;
        if (!source) {
          if (def.scope === 'context') {
            source = (this as CoreGenerator).context!;
          } else if (def.scope === 'blueprint') {
            // TODO Convert type to BaseGenerator
            source = (this as any).blueprintStorage!.getAll();
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

export const loadDerivedConfig = (configsDef: JHipsterConfigs, { application }: { application: any }) => {
  for (const [name, def] of Object.entries(configsDef)) {
    if (['storage', 'blueprint', 'context'].includes(def.scope) && def.choices) {
      applyDerivedProperty(application, name, def.choices, { addAny: true });
    }
  }
};

export const loadConfigDefaults = (configsDef: JHipsterConfigs, { context, scopes }: { context: any; scopes: CommandConfigScope[] }) => {
  for (const [name, def] of Object.entries(configsDef)) {
    if (context[name] === undefined) {
      const defaultValue = def.default ?? def.cli?.default;
      if (scopes.includes(def.scope) && defaultValue !== undefined) {
        context[name] = typeof defaultValue === 'function' ? defaultValue.call(this, context) : defaultValue;
      }
    }
  }
};
