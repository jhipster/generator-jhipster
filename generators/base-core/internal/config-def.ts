/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
