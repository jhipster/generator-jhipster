/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import BaseApplication from '../base-application/index.mjs';
import { fieldTypes } from '../../jdl/jhipster/index.mjs';
import { GENERATOR_VUE, GENERATOR_CLIENT } from '../generator-list.mjs';
import { writeEntityFiles, postWriteEntityFiles } from './entity-files-vue.mjs';
import { writeFiles, writeEntitiesFiles, cleanup } from './files-vue.mjs';

const { CommonDBTypes } = fieldTypes;
const TYPE_LONG = CommonDBTypes.LONG;

export default class DatabaseChangelogLiquibase extends BaseApplication {
  async _postConstruct() {
    await this.dependsOnJHipster(GENERATOR_CLIENT);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_VUE);
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson() {
        _.merge(this.dependabotPackageJson, this.fs.readJSON(this.fetchFromInstalledJHipster('vue', 'templates', 'package.json')));
      },
    });
  }

  get [BaseApplication.LOADING]() {
    return this.asLoadingTaskGroup(this.delegateTasksToBlueprint(() => this.loading));
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ application }) {
        application.webappEnumerationsDir = `${application.clientSrcDir}app/shared/model/enumerations/`;
      },
    });
  }

  get [BaseApplication.PREPARING]() {
    return this.asPreparingTaskGroup(this.delegateTasksToBlueprint(() => this.preparing));
  }

  get writing() {
    return {
      cleanup,
      writeFiles,
    };
  }

  get [BaseApplication.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      writeEntitiesFiles,
      writeEntityFiles,
    };
  }

  get [BaseApplication.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWritingEntities() {
    return {
      postWriteEntityFiles,
    };
  }

  get [BaseApplication.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }
}
