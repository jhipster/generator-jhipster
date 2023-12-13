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
import { JHipsterCommandDefinition } from '../../generators/base/api.js';
import { GENERATOR_APP, GENERATOR_WORKSPACES } from '../../generators/generator-list.js';

const command: JHipsterCommandDefinition = {
  arguments: {
    sampleName: {
      type: String,
    },
  },
  options: {
    global: {
      type: Boolean,
      description: 'Generate in global samples folder',
      scope: 'generator',
    },
    projectFolder: {
      type: String,
      description: 'Folder to generate the sample',
      scope: 'generator',
      env: 'JHI_FOLDER_APP',
    },
  },
  import: [GENERATOR_APP, GENERATOR_WORKSPACES],
};

export default command;
