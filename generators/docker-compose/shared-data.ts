import type { Storage } from 'yeoman-generator';
import { execaCommandSync } from 'execa';
import type { BaseEntity, BaseSources } from '../base/types.js';
import SharedData from '../base/shared-data.js';
import type { DockerComposeControl } from './types.js';
/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

export default class DockerComposeSharedData<
  C extends DockerComposeControl,
  EntityType extends BaseEntity,
  Application extends BaseSources,
> extends SharedData<C, EntityType, Application> {
  constructor(storage: Storage, { memFs, destinationPath, log, logCwd }, initialControl: Partial<C> = {}) {
    super(storage, { memFs, destinationPath, log, logCwd }, initialControl);
    const control: C = this._storage.control;
    if (!('enviromentHasDockerCompose' in control)) {
      Object.defineProperty(control, 'enviromentHasDockerCompose', {
        get: () => {
          if (control.enviromentHasDockerCompose === undefined) {
            const { exitCode } = execaCommandSync('docker compose version', { reject: false, stdio: 'pipe' });
            control.enviromentHasDockerCompose = exitCode === 0;
          }
          return control.enviromentHasDockerCompose;
        },
      });
    }
  }
}
