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
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';
import { GENERATOR_APP, GENERATOR_WORKSPACES } from '../../generators/generator-list.js';
import { parseIssue } from '../../lib/testing/github.js';

const command: JHipsterCommandDefinition = {
  configs: {
    issue: {
      argument: {
        type: String,
        description: 'GitHub issue to generate',
      },
      configure(gen: any) {
        // Gets the owner, repo and issue_number from a string such as, "jhipster/generator-jhipster#12345"
        const { owner, repository, issue } = parseIssue(gen.issue);
        if (owner) {
          gen.owner = owner;
        }
        if (repository) {
          gen.repository = repository;
        }
        gen.issueNumber = issue;
      },
      scope: 'generator',
    },
  },
  options: {
    owner: {
      type: String,
      description: 'Github repository owner',
      default: 'jhipster',
      scope: 'generator',
    },
    repository: {
      type: String,
      description: 'Github repository',
      default: 'generator-jhipster',
      scope: 'generator',
    },
    codeWorkspace: {
      type: Boolean,
      description: 'Register to code workspace',
      default: true,
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
