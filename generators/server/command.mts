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
import { JHipsterCommandDefinition } from '../base/api.mjs';
import { GENERATOR_JAVA } from '../generator-list.mjs';

const command: JHipsterCommandDefinition = {
  options: {
    jhipsterDependenciesVersion: {
      description: 'jhipster-dependencies version to use, this option is not persisted',
      type: String,
      env: 'JHIPSTER_DEPENDENCIES_VERSION',
      scope: 'generator',
    },
    projectVersion: {
      description: 'project version to use, this option is not persisted',
      type: String,
      env: 'JHI_PROJECT_VERSION',
      scope: 'generator',
    },
    fakeKeytool: {
      description: 'Add a fake certificate store file for test purposes',
      type: Boolean,
      env: 'FAKE_KEYTOOL',
      scope: 'generator',
      hide: true,
    },
  },
  import: [GENERATOR_JAVA],
};

export default command;
