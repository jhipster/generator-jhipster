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
import { preparePostEntityClientDerivedProperties } from '../../utils/entity.mjs';
import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION_BASE } from '../generator-list.mjs';
import type { ClientApplication } from '../client/types.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<ClientApplication>}
 */
export default class BootStrapApplicationClient extends BaseApplicationGenerator<ClientApplication> {
  constructor(args: any, options: any, features: any) {
    super(args, options, { unique: 'namespace', ...features });

    if (this.options.help) return;

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();
  }

  async _postConstruct() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_BASE);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadApplication({ application }) {
        this.loadClientConfig(undefined, application);
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareApplication({ application }) {
        this.loadDerivedClientConfig(application);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      postPreparingEntity({ entity }) {
        preparePostEntityClientDerivedProperties(entity);
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }
}
