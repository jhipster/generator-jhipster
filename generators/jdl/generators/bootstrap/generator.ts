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
import BaseGenerator from '../../../base/index.ts';
import { exportJDLTransform } from '../../support/export-jdl-transform.ts';
import { importJDLTransform } from '../../support/import-jdl-transform.ts';

import type { Config as JdlBootstrapConfig, Options as JdlBootstrapOptions } from './types.ts';

export default class JdlBootstrapGenerator extends BaseGenerator<JdlBootstrapConfig, JdlBootstrapOptions> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async jdlStore() {
        if (this.jhipsterConfig.jdlStore) {
          this.logger.warn('Storing configuration inside a JDL file is experimental');
          this.logger.info(`Using JDL store ${this.jhipsterConfig.jdlStore}`);

          const destinationPath = this.destinationPath();
          const jdlStorePath = this.destinationPath(this.jhipsterConfig.jdlStore);
          const { jdlDefinition } = this.options;

          this.setFeatures({
            commitTransformFactory: () => exportJDLTransform({ destinationPath, jdlStorePath, jdlDefinition: jdlDefinition! }),
          });
          await this.pipeline(
            { refresh: true, pendingFiles: false },
            importJDLTransform({ destinationPath, jdlStorePath, jdlDefinition: jdlDefinition! }),
          );
        }
      },
    });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.initializing;
  }
}
