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
import { extname } from 'path';
import { existsSync } from 'fs';

import BaseGenerator from '../base/index.mjs';
import command from './command.mjs';
import { downloadJdlFile } from '../../cli/download.mjs';
import importJdl from '../../cli/import-jdl.mjs';

/**
 * Add jdl extension to the file
 */
const toJdlFile = file => {
  if (!extname(file)) {
    return `${file}.jdl`;
  }
  return file;
};

export default class JdlGenerator extends BaseGenerator {
  jdlFiles?: string[];

  interactive?: boolean;
  jsonOnly?: boolean;
  ignoreApplication?: boolean;
  ignoreDeployments?: boolean;
  skipSampleRepository?: boolean;
  inline?: boolean;
  unidirectionalRelationships?: boolean;
  forceNoFiltering?: boolean;
  createEnvBuilder: any;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints('jdl');
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadArguments() {
        if ((this.env.rootGenerator() as any) === this) {
          this.parseJHipsterArguments(command.arguments);
        }
      },
      loadOptions() {
        this.parseJHipsterOptions(command.options);
      },
      checkOptions() {
        if (!this.inline && !this.jdlFiles?.length) {
          throw new Error('At least one jdl file is required.');
        }
      },
    });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      async downloadJdlFiles() {
        if (this.jdlFiles) {
          this.jdlFiles = await Promise.all(
            this.jdlFiles.map(toJdlFile).map(async filename => {
              if (!existsSync(filename)) {
                this.logger.warn(`File not found: ${filename}. Attempting download from jdl-samples repository`);
                return downloadJdlFile(filename, { skipSampleRepository: this.skipSampleRepository });
              }
              return filename;
            })
          );
        }
      },
    });
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async parseJDL() {
        await importJdl(this.jdlFiles, this.options, this.env, undefined, this.createEnvBuilder);
      },
    });
  }

  get [BaseGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}
