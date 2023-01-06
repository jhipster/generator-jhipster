/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_CLIENT, GENERATOR_LANGUAGES, GENERATOR_REACT } from '../generator-list.mjs';

import { writeEntitiesFiles, postWriteEntitiesFiles, cleanupEntitiesFiles } from './entity-files-react.mjs';
import { writeFiles, cleanupFiles } from './files-react.mjs';
import { prepareEntity } from './application/entities/index.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../client/types.mjs').ClientApplication>}
 */
export default class AngularGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_CLIENT);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_REACT);
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        const { enableTranslation } = this.jhipsterConfigWithDefaults;
        if (!enableTranslation) {
          await this.composeWithJHipster(GENERATOR_LANGUAGES);
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup(this.delegateTasksToBlueprint(() => this.composing));
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson() {
        _.merge(
          this.dependabotPackageJson,
          this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_REACT, 'templates', 'package.json'))
        );
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup(this.delegateTasksToBlueprint(() => this.loading));
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ application }) {
        application.webappEnumerationsDir = `${application.clientSrcDir}app/shared/model/enumerations/`;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup(this.delegateTasksToBlueprint(() => this.preparing));
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      react({ application, entity }) {
        prepareEntity({ entity, application });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.asPreparingEachEntityTaskGroup(this.delegateTasksToBlueprint(() => this.preparingEachEntity));
  }

  get writing() {
    return {
      cleanupFiles,
      writeFiles,
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupEntitiesFiles,
      writeEntitiesFiles,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWritingEntities() {
    return {
      postWriteEntitiesFiles,
    };
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }
}
