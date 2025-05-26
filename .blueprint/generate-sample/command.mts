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
import { join } from 'node:path';
import process from 'node:process';
import { defaultSamplesFolder } from '../constants.js';
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';
import { GENERATOR_APP, GENERATOR_WORKSPACES } from '../../generators/generator-list.js';

const command = {
  arguments: {
    sampleName: {
      type: String,
    },
  },
  configs: {
    entitiesSample: {
      cli: {
        type: String,
        description: 'Entities sample to copy',
      },
      configure: (gen: any) => {
        if (['mongodb', 'couchbase'].includes(gen.entitiesSample)) {
          gen.entitiesSample = 'document';
        }
      },
      choices: ['sql', 'sqllight', 'micro', 'sqlfull', 'none', 'neo4j', 'mongodb', 'document', 'cassandra', 'couchbase'],
      scope: 'generator',
    },
    global: {
      cli: {
        type: Boolean,
        description: 'Generate in global samples folder',
      },
      configure: (gen: any) => {
        if (gen.global && !gen.projectFolder) {
          gen.projectFolder = join(gen._globalConfig.get('samplesFolder') ?? defaultSamplesFolder, gen.sampleName);
        }
      },
      scope: 'generator',
    },
    projectFolder: {
      cli: {
        type: String,
        description: 'Folder to generate the sample',
        env: 'JHI_FOLDER_APP',
      },
      configure: (gen: any) => {
        if (!gen.projectFolder) {
          gen.projectFolder = process.cwd();
        }
      },
      scope: 'generator',
    },
    sampleYorcFolder: {
      cli: {
        type: Boolean,
      },
      description: 'Treat sample arg as .yo-rc.json folder path',
      scope: 'generator',
    },
  },
  import: [GENERATOR_APP, GENERATOR_WORKSPACES],
} as const satisfies JHipsterCommandDefinition;

export default command;
