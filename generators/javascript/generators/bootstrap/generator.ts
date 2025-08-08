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
import { packageJson } from '../../../../lib/index.ts';
import { JavascriptApplicationGenerator } from '../../generator.ts';
import { isReservedTypescriptKeyword } from '../../support/reserved-words.ts';

export default class JavascriptBootstrapGenerator extends JavascriptApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('base-application');
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadNodeDependencies({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('javascript', 'resources', 'package.json'),
        );
      },
      jsExtensions({ applicationDefaults, application }) {
        applicationDefaults({
          cjsExtension: application.packageJsonTypeCommonjs ? '.js' : '.cjs',
          mjsExtension: application.packageJsonTypeModule ? '.js' : '.mjs',
        });
      },
    });
  }

  get [JavascriptApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      addSource({ application, source }) {
        source.mergeClientPackageJson = args => {
          this.mergeDestinationJson(`${application.clientRootDir}package.json`, args);
        };
      },
    });
  }

  get [JavascriptApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      preparing({ entityName }) {
        if (isReservedTypescriptKeyword(entityName)) {
          throw new Error(`The entity name "${entityName}" is a reserved TypeScript keyword. It may cause issues in your application.`);
        }
      },
    });
  }

  get [JavascriptApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      preparing({ entity, field }) {
        if (isReservedTypescriptKeyword(field.fieldName)) {
          throw new Error(`The field name "${field.fieldName}" in entity "${entity.name}" is a reserved TypeScript keyword.`);
        }
      },
    });
  }

  get [JavascriptApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      preparing({ entity, relationship }) {
        if (isReservedTypescriptKeyword(relationship.relationshipName)) {
          throw new Error(
            `The relationship name "${relationship.relationshipName}" in entity "${entity.name}" is a reserved TypeScript keyword.`,
          );
        }
      },
    });
  }

  get [JavascriptApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [{ templates: [{ override: false, file: 'package.json' }] }],
          context: application,
        });
      },
    });
  }

  get [JavascriptApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      mergePackageJson({ application, source }) {
        const {
          packageJsonNodeEngine,
          packageJsonType,
          dasherizedBaseName,
          projectDescription,
          packageJsonScripts,
          clientPackageJsonScripts,
        } = application;

        this.packageJson.merge({ scripts: packageJsonScripts! });

        this.packageJson.defaults({
          name: dasherizedBaseName,
          version: '0.0.0',
          description: projectDescription,
          license: 'UNLICENSED',
        });

        if (packageJsonType === 'module') {
          this.packageJson.merge({ type: packageJsonType });
        }

        if (packageJsonNodeEngine) {
          const packageJsonEngines: any = this.packageJson.get('engines') ?? {};
          this.packageJson.set('engines', {
            ...packageJsonEngines,
            node: typeof packageJsonNodeEngine === 'string' ? packageJsonNodeEngine : packageJson.engines.node,
          });
        }

        if (clientPackageJsonScripts && Object.keys(clientPackageJsonScripts).length > 0) {
          source.mergeClientPackageJson!({ scripts: clientPackageJsonScripts });
        }
      },
    });
  }

  get [JavascriptApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
