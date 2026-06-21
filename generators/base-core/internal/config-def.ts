import type { JHipsterConfigs } from '../../../lib/command/index.ts';
import type BaseGenerator from '../../base/generator.ts';
import type { Application as BaseApplicationApplication, Entity as BaseApplicationEntity } from '../../base-application/types.d.ts';
import type CoreGenerator from '../index.ts';
import type { Config as BaseCoreConfig } from '../types.d.ts';

/** @deprecated */
export function loadConfig(
  this: CoreGenerator,
  configsDef: JHipsterConfigs | undefined,
  data: { application: BaseApplicationApplication<BaseApplicationEntity> },
): void;
export function loadConfig(
  configsDef: JHipsterConfigs | undefined,
  data: { application: BaseApplicationApplication<BaseApplicationEntity>; config?: BaseCoreConfig },
): void;
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
          switch (def.scope) {
            case 'blueprint': {
              // TODO Convert type to BaseGenerator
              source = (this as BaseGenerator).blueprintStorage!.getAll();
              break;
            }
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
