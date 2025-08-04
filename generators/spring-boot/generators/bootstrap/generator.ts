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
import { mutateData } from '../../../../lib/utils/object.ts';
import { getDatabaseTypeData } from '../../../server/support/database.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';

export default class BootstrapGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
      await this.dependsOnBootstrap('server');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareSpringData({ application }) {
        mutateData(application, {
          springDataDescription: ({ databaseType, reactive }) => {
            let springDataDatabase: string;
            if (databaseType !== 'sql') {
              springDataDatabase = getDatabaseTypeData(databaseType as string).name;
              if (reactive) {
                springDataDatabase += ' reactive';
              }
            } else {
              springDataDatabase = reactive ? 'R2DBC' : 'JPA';
            }
            return `Spring Data ${springDataDatabase}`;
          },
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.PREPARING]() {
    return this.preparing;
  }
}
