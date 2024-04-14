/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { isFileStateModified } from 'mem-fs-editor/state';
import BaseApplicationGenerator from '../base-application/index.js';

import { writeFiles, prettierConfigFiles } from './files.js';
import {
  MAIN_DIR,
  TEST_DIR,
  SERVER_MAIN_RES_DIR,
  JHIPSTER_DOCUMENTATION_URL,
  JHIPSTER_DOCUMENTATION_ARCHIVE_PATH,
} from '../generator-constants.js';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.js';
import { GENERATOR_COMMON, GENERATOR_GIT } from '../generator-list.js';
import command from './command.js';
import { createPrettierTransform } from '../bootstrap/support/prettier-support.js';
import { loadStoredAppOptions } from '../app/support/index.js';

const { REACT, ANGULAR } = clientFrameworkTypes;

export default class CommonGenerator extends BaseApplicationGenerator {
  command = command;

  async beforeQueue() {
    loadStoredAppOptions.call(this);

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
      await this.dependsOnJHipster(GENERATOR_GIT);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async loadOptions() {
        await this.parseCurrentJHipsterCommand();
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async prompting({ control }) {
        if (control.existingProject && this.options.askAnswered !== true) return;
        await this.promptCurrentJHipsterCommand();
      },
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
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

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      migrateEntity({ entityConfig, entityStorage }) {
        for (const field of entityConfig.fields) {
          if (field.javadoc) {
            field.documentation = field.javadoc;
            delete field.javadoc;
          }
          if (field.fieldTypeJavadoc) {
            field.fieldTypeDocumentation = field.fieldTypeJavadoc;
            delete field.fieldTypeJavadoc;
          }
        }
        for (const relationship of entityConfig.relationships) {
          if (relationship.javadoc) {
            relationship.documentation = relationship.javadoc;
            delete relationship.javadoc;
          }
        }
        if (entityConfig.javadoc) {
          entityConfig.documentation = entityConfig.javadoc;
          delete entityConfig.javadoc;
        } else {
          entityStorage.save();
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.configuringEachEntity);
  }

  // Public API method used by the getter and also by Blueprints
  get loading() {
    return this.asLoadingTaskGroup({
      async loadCommand({ application }) {
        await this.loadCurrentJHipsterCommandConfig(application);
      },
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_COMMON, 'resources', 'package.json'),
        );
      },

      loadConfig({ applicationDefaults }) {
        applicationDefaults({
          prettierTabWidth: this.jhipsterConfig.prettierTabWidth ?? 2,
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  // Public API method used by the getter and also by Blueprints
  get preparing() {
    return this.asPreparingTaskGroup({
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
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      async formatSonarProperties() {
        this.queueTransformStream(
          {
            name: 'prettifying sonar-project.properties',
            filter: file =>
              isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && file.path.endsWith('sonar-project.properties'),
            refresh: false,
          },
          await createPrettierTransform.call(this, { extensions: 'properties', prettierProperties: true }),
        );
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
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
        if (this.isJhipsterVersionLessThan('8.0.0-rc.2')) {
          if (!application.skipCommitHook) {
            this.removeFile('.lintstagedrc.js');
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
    return this.asPostWritingTaskGroup({
      setConfig({ application }) {
        const packageJsonConfigStorage = this.packageJson.createStorage('config').createProxy();
        if (application.defaultEnvironment) {
          packageJsonConfigStorage.default_environment = application.defaultEnvironment;
        }
      },
      addJHipsterDependencies({ application }) {
        if (application.skipJhipsterDependencies) return;

        this.packageJson.merge({
          devDependencies: {
            'generator-jhipster': application.jhipsterVersion,
            ...Object.fromEntries(application.blueprints.map(blueprint => [blueprint.name, blueprint.version])),
          },
        });
      },
      addCommitHookDependencies({ application }) {
        if (application.skipCommitHook) return;
        this.packageJson.merge({
          scripts: {
            prepare: 'husky',
          },
          devDependencies: {
            husky: application.nodeDependencies.husky,
            'lint-staged': application.nodeDependencies['lint-staged'],
            prettier: application.nodeDependencies.prettier,
            'prettier-plugin-packagejson': application.nodeDependencies['prettier-plugin-packagejson'],
          },
        });
        if (application.backendTypeJavaAny) {
          this.packageJson.merge({
            devDependencies: {
              'prettier-plugin-java': application.nodeDependencies['prettier-plugin-java'],
            },
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
