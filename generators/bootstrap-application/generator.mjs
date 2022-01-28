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
import BaseGenerator from '../generator-base.js';
import { PRIORITY_PREFIX, LOADING_PRIORITY, PREPARING_PRIORITY } from '../../lib/constants/priorities.mjs';

export default class extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', taskPrefix: PRIORITY_PREFIX, ...features });

    if (this.options.help) return;

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();
  }

  get loading() {
    return {
      loadApplication({ application }) {
        this.loadAppConfig(undefined, application);
        this.loadClientConfig(undefined, application);
        this.loadServerConfig(undefined, application);
        this.loadTranslationConfig(undefined, application);
        this.loadPlatformConfig(undefined, application);
      },
    };
  }

  get [LOADING_PRIORITY]() {
    return this.loading;
  }

  get preparing() {
    return {
      prepareApplication({ application }) {
        this.loadDerivedAppConfig(application);
        this.loadDerivedClientConfig(application);
        this.loadDerivedServerConfig(application);
        this.loadDerivedPlatformConfig(application);
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    return this.preparing;
  }
}
