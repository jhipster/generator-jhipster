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
import chalk from 'chalk';
import { isFileStateModified } from 'mem-fs-editor/state';

import { clientFrameworkTypes, fieldTypes } from '../../lib/jhipster/index.ts';
import { upperFirstCamelCase } from '../../lib/utils/index.ts';
import { createNeedleCallback } from '../base-core/support/index.ts';
import { ClientApplicationGenerator } from '../client/generator.ts';
import {
  generateEntityClientEnumImports as getClientEnumImportsFormat,
  generateEntityClientFields as getHydratedEntityClientFields,
  generateEntityClientImports as formatEntityClientImports,
} from '../client/support/index.ts';
import type { Entity as ClientEntity, Field as ClientField } from '../client/types.ts';
import { JAVA_WEBAPP_SOURCES_DIR } from '../index.ts';
import { writeEslintClientRootConfigFile } from '../javascript-simple-application/generators/eslint/support/tasks.ts';
import type { Config as SpringBootConfig } from '../spring-boot/types.d.ts';

import cleanupOldFilesTask from './cleanup.ts';
import { cleanupEntitiesFiles, postWriteEntitiesFiles, writeEntitiesFiles } from './entity-files-react.ts';
import { writeFiles } from './files-react.ts';
import { isTranslatedReactFile, translateReactFilesTransform } from './support/index.ts';

const { CommonDBTypes } = fieldTypes;
const TYPE_BOOLEAN = CommonDBTypes.BOOLEAN;
const { REACT } = clientFrameworkTypes;

export default class ReactGenerator extends ClientApplicationGenerator<
  ClientEntity<ClientField & { fieldValidateRulesPatternReact?: string }> & { entityReactState?: string }
> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('react');
    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:client:i18n');
      await this.dependsOnJHipster('client');
      await this.dependsOnJHipster('languages');
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        await this.composeWithJHipster('jhipster:client:common');
        if ((this.jhipsterConfigWithDefaults as SpringBootConfig).websocket === 'spring-websocket') {
          await this.composeWithJHipster('jhipster:client:encode-csrf-token');
        }
      },
    });
  }

  get [ClientApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('react', 'resources', 'package.json'),
        );
      },
      applicationDefaults({ applicationDefaults }) {
        applicationDefaults({
          __override__: true,
          typescriptEslint: true,
        });
      },
    });
  }

  get [ClientApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      applicationDefaults({ application, applicationDefaults }) {
        application.prettierExtensions.push('html', 'tsx', 'css', 'scss');
        if (application.clientBundlerWebpack) {
          application.prettierFolders.push('webpack/');
        }
        if (!application.backendTypeJavaAny && application.clientSrcDir !== JAVA_WEBAPP_SOURCES_DIR) {
          // When we have a java backend, 'src/**' is already added by java:bootstrap
          application.prettierFolders.push(`${application.clientSrcDir}**/`);
        }

        applicationDefaults({
          __override__: true,
          webappEnumerationsDir: app => `${app.clientSrcDir}app/shared/model/enumerations/`,
        });
      },
      async javaNodeBuildPaths({ application }) {
        const { clientBundlerWebpack, javaNodeBuildPaths } = application;

        javaNodeBuildPaths?.push('.postcss.config.js', 'tsconfig.json');
        if (clientBundlerWebpack) {
          javaNodeBuildPaths?.push('webpack/');
        }
      },
      prepareForTemplates({ application, source }) {
        source.addWebpackConfig = args => {
          const webpackPath = `${application.clientRootDir}webpack/webpack.common.js`;
          const ignoreNonExisting = this.ignoreNeedlesError && 'Webpack configuration file not found';
          this.editFile(
            webpackPath,
            { ignoreNonExisting },
            createNeedleCallback({
              needle: 'jhipster-needle-add-webpack-config',
              contentToAdd: `,${args.config}`,
            }),
          );
        };

        source.addClientStyle = ({ style, comment }) => {
          comment = comment
            ? `/* ==========================================================================
${comment}
========================================================================== */
`
            : '';
          this.editFile(
            `${application.clientSrcDir}app/app.scss`,
            createNeedleCallback({
              needle: 'scss-add-main',
              contentToAdd: `${comment}${style}`,
              contentToCheck: style,
            }),
          );
        };

        source.addEntitiesToClient = ({ application, entities }) => {
          const entityRoutes = `${application.clientSrcDir}app/entities/routes.tsx`;
          const entityReducers = `${application.clientSrcDir}app/entities/reducers.ts`;
          const entityMenu = `${application.clientSrcDir}app/entities/menu.tsx`;
          for (const entity of entities) {
            const {
              entityAngularName,
              entityInstance,
              entityFolderName,
              entityFileName,
              entityPage,
              entityUrl,
              entityTranslationKeyMenu,
              entityNameHumanized,
            } = entity;

            this.editFile(
              entityMenu,
              createNeedleCallback({
                needle: 'add-entity-to-menu',
                contentToAdd: `<MenuItem icon="asterisk" to="/${entityPage}">
  ${application.enableTranslation ? `<Translate contentKey="global.menu.entities.${entityTranslationKeyMenu}" />` : `${entityNameHumanized}`}
</MenuItem>`,
              }),
            );
            this.editFile(
              entityRoutes,
              createNeedleCallback({
                needle: 'add-route-import',
                contentToAdd: `import ${entityAngularName} from './${entityFolderName}';`,
              }),
              createNeedleCallback({
                needle: 'add-route-path',
                contentToAdd: `<Route path="/${entityUrl}/*" element={<${entityAngularName} />} />`,
              }),
            );
            this.editFile(
              entityReducers,
              createNeedleCallback({
                needle: 'add-reducer-import',
                contentToAdd: `import ${entityInstance} from 'app/entities/${entityFolderName}/${entityFileName}.reducer';`,
              }),
              createNeedleCallback({
                needle: 'add-reducer-combine',
                contentToAdd: `${entityInstance},`,
              }),
            );
          }
        };
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      react({ application, entity }) {
        entity.entityReactState = application.applicationTypeMonolith
          ? entity.entityInstance
          : `${application.lowercaseBaseName}.${entity.entityInstance}`;
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      react({ field }) {
        field.fieldValidateRulesPatternReact ??= field.fieldValidateRulesPattern?.replace(/'/g, "\\'");
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get default() {
    return this.asDefaultTaskGroup({
      queueTranslateTransform({ application }) {
        if (!application.enableTranslation) {
          this.queueTransformStream(
            {
              name: 'translating react application',
              filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && isTranslatedReactFile(file),
              refresh: false,
            },
            translateReactFilesTransform(application.getWebappTranslation!),
          );
        }
      },
    });
  }

  get [ClientApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ control }) {
        await control.cleanupFiles({
          '9.0.0-alpha.0': [
            // Try to remove possibles old eslint config files
            'eslint.config.js',
            'eslint.config.mjs',
            'postcss.config.js',
          ],
        });
      },
      cleanupOldFilesTask,
      writeEslintClientRootConfigFile,
      writeFiles,
    });
  }

  get [ClientApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupEntitiesFiles,
      writeEntitiesFiles,
    };
  }

  get [ClientApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      clientBundler({ application, source }) {
        const { nodeDependencies } = application;
        source.mergeClientPackageJson!({
          overrides: {
            'browser-sync': nodeDependencies['browser-sync'],
          },
        });
        if (application.clientRootDir) {
          this.packageJson.merge({
            overrides: {
              'browser-sync': application.nodeDependencies['browser-sync'],
            },
          });
        }
      },
      addMicrofrontendDependencies({ application, source }) {
        if (!application.microfrontend) return;
        const { applicationTypeGateway } = application;
        if (applicationTypeGateway) {
          source.mergeClientPackageJson!({
            devDependencies: { '@module-federation/utilities': null },
          });
        }
        source.mergeClientPackageJson!({
          devDependencies: { '@module-federation/enhanced': null },
        });
      },
      addWebsocketDependencies({ application, source }) {
        const { communicationSpringWebsocket, nodeDependencies } = application;
        if (communicationSpringWebsocket) {
          source.mergeClientPackageJson!({
            dependencies: {
              rxjs: nodeDependencies.rxjs,
              'sockjs-client': nodeDependencies['sockjs-client'],
              'webstomp-client': nodeDependencies['webstomp-client'],
            },
          });
        }
      },
      sonar({ application, source }) {
        const { clientI18nDir, clientDistDir, clientSrcDir, temporaryDir } = application;
        source.addSonarProperties?.([
          { key: 'sonar.test.inclusions', value: `${clientSrcDir}app/**/*.spec.ts, ${clientSrcDir}app/**/*.spec.tsx`, valueSep: ', ' },
          { key: 'sonar.testExecutionReportPaths', value: `${temporaryDir}test-results/jest/TESTS-results-sonar.xml` },
          { key: 'sonar.javascript.lcov.reportPaths', value: `${temporaryDir}test-results/lcov.info` },
          {
            key: 'sonar.exclusions',
            value: `${clientSrcDir}content/**/*.*, ${clientI18nDir}*.ts, ${clientDistDir}**/*.*`,
            valueSep: ', ',
          },
        ]);
      },
    });
  }

  get [ClientApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return {
      postWriteEntitiesFiles,
    };
  }

  get [ClientApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        this.log.ok('React application generated successfully.');
        this.log.log(
          chalk.green(`  Start your Webpack development server with:
  ${chalk.yellow.bold(`${application.nodePackageManager} start`)}
`),
        );
      },
    });
  }

  get [ClientApplicationGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  /**
   * @private
   * Generate Entity Client Field Default Values
   */
  generateEntityClientFieldDefaultValues(fields: ClientField[]): Record<string, string> {
    const defaultVariablesValues: Record<string, string> = {};
    fields.forEach(field => {
      const { fieldType, fieldName } = field;
      if (fieldType === TYPE_BOOLEAN) {
        defaultVariablesValues[fieldName] = `${fieldName}: false,`;
      }
    });
    return defaultVariablesValues;
  }

  generateEntityClientFields(
    primaryKey: Parameters<typeof getHydratedEntityClientFields>[0],
    fields: Parameters<typeof getHydratedEntityClientFields>[1],
    relationships: Parameters<typeof getHydratedEntityClientFields>[2],
    dto: Parameters<typeof getHydratedEntityClientFields>[3],
    customDateType: Parameters<typeof getHydratedEntityClientFields>[4],
    embedded: Parameters<typeof getHydratedEntityClientFields>[5] = false,
  ) {
    return getHydratedEntityClientFields(primaryKey, fields, relationships, dto, customDateType, embedded, REACT);
  }

  generateEntityClientImports(
    relationships: Parameters<typeof formatEntityClientImports>[0],
    dto: Parameters<typeof formatEntityClientImports>[1],
  ) {
    return formatEntityClientImports(relationships, dto, REACT);
  }

  generateEntityClientEnumImports(fields: ClientField[]) {
    return getClientEnumImportsFormat(fields, REACT);
  }

  /**
   * get the an upperFirst camelCase value.
   * @param {string} value string to convert
   */
  upperFirstCamelCase(value: string): string {
    return upperFirstCamelCase(value);
  }
}
