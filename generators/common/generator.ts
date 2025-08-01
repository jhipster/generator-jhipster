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

import { isFileStateModified } from 'mem-fs-editor/state';
import { CheckRepoActions } from 'simple-git';
import BaseApplicationGenerator from '../base-application/index.js';

import { JHIPSTER_DOCUMENTATION_URL, MAIN_DIR, TEST_DIR } from '../generator-constants.js';
import { GENERATOR_COMMON, GENERATOR_GIT } from '../generator-list.js';
import { createPrettierTransform } from '../bootstrap/support/prettier-support.js';
import type { PropertiesFileLines } from '../base-core/support/index.ts';
import { editPropertiesFileCallback } from '../base-core/support/index.ts';
import command from './command.js';
import { writeFiles } from './files.js';
import type {
  Application as CommonApplication,
  Config as CommonConfig,
  Entity as CommonEntity,
  Options as CommonOptions,
  Source as CommonSource,
} from './types.js';

export default class CommonGenerator extends BaseApplicationGenerator<
  CommonEntity,
  CommonApplication<CommonEntity>,
  CommonConfig,
  CommonOptions,
  CommonSource
> {
  command = command;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplicationBase();
      await this.dependsOnJHipster(GENERATOR_GIT);
    }
  }

  // Public API method used by the getter and also by Blueprints
  get configuring() {
    return this.asConfiguringTaskGroup({
      async configureMonorepository() {
        if (this.jhipsterConfig.monorepository) return;

        const git = this.createGit();
        if ((await git.checkIsRepo()) && !(await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT))) {
          this.jhipsterConfig.monorepository = true;
        }
      },
      configureCommitHook() {
        if (this.jhipsterConfig.monorepository) {
          this.jhipsterConfig.skipCommitHook = true;
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        await this.composeWithJHipster('jhipster:javascript:prettier');
        if (!this.jhipsterConfig.skipCommitHook) {
          await this.composeWithJHipster('jhipster:javascript:husky');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      migrateEntity({ entityConfig, entityStorage }) {
        for (const field of entityConfig.fields!) {
          if (field.javadoc) {
            field.documentation ??= field.javadoc;
            delete field.javadoc;
          }
          if (field.fieldTypeJavadoc) {
            field.fieldTypeDocumentation ??= field.fieldTypeJavadoc;
            delete field.fieldTypeJavadoc;
          }
        }
        for (const relationship of entityConfig.relationships!) {
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
      checkSuffix({ application }) {
        if (application.entitySuffix === application.dtoSuffix) {
          throw new Error('Entities cannot be generated as the entity suffix and DTO suffix are equals!');
        }
      },
      setupConstants({ applicationDefaults }) {
        // Make constants available in templates
        applicationDefaults({
          srcMain: MAIN_DIR,
          srcTest: TEST_DIR,
          documentationUrl: JHIPSTER_DOCUMENTATION_URL,
        });
      },
      sonarSourceApi({ source }) {
        source.ignoreSonarRule = ({ ruleId, ruleKey, resourceKey, comment }) => {
          this.editFile(
            'sonar-project.properties',
            editPropertiesFileCallback([
              {
                key: 'sonar.issue.ignore.multicriteria',
                value: ruleId,
                valueSep: ', ',
              },
              {
                key: `sonar.issue.ignore.multicriteria.${ruleId}.resourceKey`,
                value: resourceKey,
                comment,
              },
              {
                key: `sonar.issue.ignore.multicriteria.${ruleId}.ruleKey`,
                value: ruleKey,
              },
            ]),
          );
        };
        source.addSonarProperties = properties => {
          // Adds new properties before the sonar.issue.ignore.multicriteria key
          this.editFile(
            'sonar-project.properties',
            editPropertiesFileCallback((lines, newValueCallback) => {
              let multicriteriaIndex = lines.findIndex(line => Array.isArray(line) && line[0] === 'sonar.issue.ignore.multicriteria');
              if (lines[multicriteriaIndex - 1] === '') {
                multicriteriaIndex--;
              }
              const indexToInsert = multicriteriaIndex === -1 ? lines.length : multicriteriaIndex;
              for (const { key, value, valueSep, comment } of properties) {
                const existingLine = lines.find(line => Array.isArray(line) && line[0] === key) as [string, string] | undefined;
                if (existingLine) {
                  existingLine[1] = newValueCallback(value, existingLine[1], valueSep);
                } else {
                  const itemsToAdd: PropertiesFileLines = [[key, newValueCallback(value)]];
                  if (comment) {
                    itemsToAdd.unshift(comment);
                  }
                  lines.splice(indexToInsert, 0, ...itemsToAdd);
                }
              }
              return lines;
            }),
          );
        };
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
    return this.asWritingTaskGroup({
      async cleanup({ application, control }) {
        await control.cleanupFiles({
          '7.1.1': [[!application.skipCommitHook, '.huskyrc']],
          '7.6.1': [[application.skipClient!, 'npmw', 'npmw.cmd']],
          '8.0.0-rc.2': [[!application.skipCommitHook, '.lintstagedrc.js']],
        });
      },
      ...writeFiles(),
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      setConfig({ application }) {
        const packageJsonConfigStorage = this.packageJson.createStorage<Record<string, string>>('config').createProxy();
        if (application.defaultEnvironment) {
          packageJsonConfigStorage.default_environment = application.defaultEnvironment;
        }
      },
      addJHipsterDependencies({ application }) {
        if (application.skipJhipsterDependencies) return;

        this.packageJson.merge({
          devDependencies: {
            'generator-jhipster': application.jhipsterVersion,
            ...Object.fromEntries((this.jhipsterConfig.blueprints ?? []).map(blueprint => [blueprint.name, blueprint.version])),
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
