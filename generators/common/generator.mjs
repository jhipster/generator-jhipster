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
/* eslint-disable consistent-return */
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';

import { writeFiles, prettierConfigFiles } from './files.mjs';
import {
  MAIN_DIR,
  TEST_DIR,
  SERVER_MAIN_RES_DIR,
  JHIPSTER_DOCUMENTATION_URL,
  JHIPSTER_DOCUMENTATION_ARCHIVE_PATH,
} from '../generator-constants.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { packageJson } from '../../lib/index.mjs';
import { GENERATOR_COMMON, GENERATOR_BOOTSTRAP_APPLICATION, GENERATOR_GIT } from '../generator-list.mjs';
import command from './command.mjs';

const { REACT, ANGULAR } = clientFrameworkTypes;
/**
 * @class
 * @extends {BaseApplicationGenerator<import('../bootstrap-application-base/types.js').CommonClientServerApplication>}
 */
export default class CommonGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    await this.dependsOnJHipster(GENERATOR_GIT);

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_COMMON);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadOptions() {
        this.parseJHipsterOptions(command.options);
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get configuring() {
    return {
      async configureMonorepository() {
        if (this.jhipsterConfig.monorepository) return;

        const git = this.createGit();
        if ((await git.checkIsRepo()) && !(await git.checkIsRepo('root'))) {
          this.jhipsterConfig.monorepository = true;
        }
      },
      configureCommitHook() {
        if (this.jhipsterConfig.monorepository) {
          this.jhipsterConfig.skipCommitHook = true;
        }
      },
    };
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  // Public API method used by the getter and also by Blueprints
  get loading() {
    return {
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_COMMON, 'resources', 'package.json'),
        );
      },

      loadConfig({ application }) {
        application.prettierTabWidth = this.jhipsterConfig.prettierTabWidth || 2;
      },
    };
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  // Public API method used by the getter and also by Blueprints
  get preparing() {
    return {
      setupConstants({ application }) {
        // Make constants available in templates
        application.MAIN_DIR = MAIN_DIR;
        application.TEST_DIR = TEST_DIR;
        application.SERVER_MAIN_RES_DIR = SERVER_MAIN_RES_DIR;
        application.ANGULAR = ANGULAR;
        application.REACT = REACT;

        // Make documentation URL available in templates
        application.DOCUMENTATION_URL = JHIPSTER_DOCUMENTATION_URL;
        application.DOCUMENTATION_ARCHIVE_PATH = JHIPSTER_DOCUMENTATION_ARCHIVE_PATH;
      },
    };
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return {
      cleanup({ application }) {
        if (this.isJhipsterVersionLessThan('7.1.1')) {
          if (!application.skipCommitHook) {
            this.removeFile('.huskyrc');
          }
        }
        if (this.isJhipsterVersionLessThan('7.6.1')) {
          if (application.skipClient) {
            this.removeFile('npmw');
            this.removeFile('npmw.cmd');
          }
        }
      },
      writePrettierConfig({ application }) {
        return this.writeFiles({
          sections: prettierConfigFiles,
          context: application,
        });
      },
      ...writeFiles(),
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return {
      addCommitHookDependencies({ application }) {
        if (application.skipCommitHook) return;
        this.packageJson.merge({
          scripts: {
            prepare: 'husky install',
          },
          devDependencies: {
            husky: application.nodeDependencies.husky,
            'lint-staged': application.nodeDependencies['lint-staged'],
          },
        });
      },
    };
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
