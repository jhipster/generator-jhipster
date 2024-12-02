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
import assert from 'node:assert';
import chalk from 'chalk';
import { isFileStateModified } from 'mem-fs-editor/state';
import { camelCase, startCase } from 'lodash-es';

import BaseApplicationGenerator from '../base-application/index.js';
import { clientFrameworkTypes, fieldTypes } from '../../lib/jhipster/index.js';
import { GENERATOR_CLIENT, GENERATOR_LANGUAGES, GENERATOR_VUE } from '../generator-list.js';
import {
  generateEntityClientImports as formatEntityClientImports,
  generateEntityClientEnumImports as getClientEnumImportsFormat,
  generateEntityClientFields as getHydratedEntityClientFields,
} from '../client/support/index.js';
import { createNeedleCallback } from '../base/support/index.js';
import { writeEslintClientRootConfigFile } from '../javascript/generators/eslint/support/tasks.js';
import { cleanupEntitiesFiles, postWriteEntityFiles, writeEntityFiles } from './entity-files-vue.js';
import cleanupOldFilesTask from './cleanup.js';
import { writeEntitiesFiles, writeFiles } from './files-vue.js';
import { convertTranslationsSupport, isTranslatedVueFile, translateVueFilesTransform } from './support/index.js';

const { CommonDBTypes } = fieldTypes;
const { VUE } = clientFrameworkTypes;
const TYPE_BOOLEAN = CommonDBTypes.BOOLEAN;

export default class VueGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_CLIENT);
      await this.dependsOnJHipster(GENERATOR_LANGUAGES);
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configureDevServerPort() {
        if (this.jhipsterConfig.devServerPort === undefined) return;
        if (this.isJhipsterVersionLessThan('8.7.4')) {
          // Migrate old devServerPort with new one
          const { applicationIndex = 0 } = this.jhipsterConfigWithDefaults;
          this.jhipsterConfig.devServerPort = 9000 + applicationIndex;
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_VUE, 'resources', 'package.json'),
        );
      },
      applicationDefauts({ applicationDefaults }) {
        applicationDefaults({
          __override__: true,
          typescriptEslint: true,
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      applicationDefauts({ applicationDefaults }) {
        applicationDefaults({
          __override__: true,
          eslintConfigFile: app => `eslint.config.${app.packageJsonType === 'module' ? 'js' : 'mjs'}`,
          clientWebappDir: app => `${app.clientSrcDir}app/`,
          webappEnumerationsDir: app => `${app.clientWebappDir}shared/model/enumerations/`,
        });
      },
      async javaNodeBuildPaths({ application }) {
        const { clientBundlerVite, clientBundlerWebpack, microfrontend, javaNodeBuildPaths } = application;

        javaNodeBuildPaths?.push('.postcssrc.js', 'tsconfig.json', 'tsconfig.app.json');
        if (microfrontend) {
          javaNodeBuildPaths?.push('module-federation.config.cjs');
        }
        if (clientBundlerWebpack) {
          javaNodeBuildPaths?.push('webpack/');
        } else if (clientBundlerVite) {
          javaNodeBuildPaths?.push('vite.config.mts');
        }
      },
      prepareForTemplates({ application, source }) {
        application.addPrettierExtensions?.(['html', 'vue', 'css', 'scss']);

        source.addWebpackConfig = args => {
          if (!application.clientBundlerWebpack) {
            throw new Error('This application is not webpack based');
          }
          const webpackPath = `${application.clientRootDir}webpack/webpack.common.js`;
          const ignoreNonExisting = this.sharedData.getControl().ignoreNeedlesError && 'Webpack configuration file not found';
          this.editFile(
            webpackPath,
            { ignoreNonExisting },
            createNeedleCallback({
              needle: 'jhipster-needle-add-webpack-config',
              contentToAdd: `,${args.config}`,
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
      async queueTranslateTransform({ control, application }) {
        const { enableTranslation, clientSrcDir } = application;
        const { getWebappTranslation } = control;

        assert.ok(getWebappTranslation, 'getWebappTranslation is required');

        this.queueTransformStream(
          {
            name: 'translating vue application',
            filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && isTranslatedVueFile(file),
            refresh: false,
          },
          translateVueFilesTransform.call(this, { enableTranslation, getWebappTranslation }),
        );
        if (enableTranslation) {
          const { transform, isTranslationFile } = convertTranslationsSupport({ clientSrcDir });
          this.queueTransformStream(
            {
              name: 'converting vue translations',
              filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && isTranslationFile(file),
              refresh: false,
            },
            transform,
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ control, application }) {
        await control.cleanupFiles({
          '8.6.1': ['.eslintrc.json', '.eslintignore'],
          '8.7.4': [
            [
              application.microfrontend!,
              `${application.srcMainWebapp}microfrontends/entities-menu-test.vue`,
              `${application.srcMainWebapp}microfrontends/entities-menu-component-test.ts`,
              `${application.srcMainWebapp}microfrontends/entities-router-test.ts`,
            ],
          ],
        });
      },
      cleanupOldFilesTask,
      writeEslintClientRootConfigFile,
      writeFiles,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      cleanupEntitiesFiles,
      writeEntitiesFiles,
      writeEntityFiles,
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addPackageJsonScripts({ application, source }) {
        const { clientBundlerVite, clientBundlerWebpack, clientPackageManager } = application;
        if (clientBundlerVite) {
          source.mergeClientPackageJson!({
            scripts: {
              'webapp:build:dev': `${clientPackageManager} run vite-build`,
              'webapp:build:prod': `${clientPackageManager} run vite-build`,
              'webapp:dev': `${clientPackageManager} run vite-serve`,
              'webapp:serve': `${clientPackageManager} run vite-serve`,
              'vite-serve': 'vite',
              'vite-build': 'vite build',
            },
          });
        } else if (clientBundlerWebpack) {
          source.mergeClientPackageJson!({
            scripts: {
              'webapp:build:dev': `${clientPackageManager} run webpack -- --mode development --env stats=minimal`,
              'webapp:build:prod': `${clientPackageManager} run webpack -- --mode production --env stats=minimal`,
              'webapp:dev': `${clientPackageManager} run webpack-dev-server -- --mode development --env stats=normal`,
              'webpack-dev-server': 'webpack serve --config webpack/webpack.common.js',
              webpack: 'webpack --config webpack/webpack.common.js',
            },
          });
        }
      },
      addMicrofrontendDependencies({ application, source }) {
        const { clientBundlerVite, clientBundlerWebpack, enableTranslation, microfrontend } = application;
        if (!microfrontend) return;
        if (clientBundlerVite) {
          source.mergeClientPackageJson!({
            devDependencies: {
              '@originjs/vite-plugin-federation': '1.3.6',
            },
          });
        } else if (clientBundlerWebpack) {
          source.mergeClientPackageJson!({
            devDependencies: {
              '@module-federation/enhanced': null,
              'browser-sync-webpack-plugin': null,
              'copy-webpack-plugin': null,
              'css-loader': null,
              'css-minimizer-webpack-plugin': null,
              'html-webpack-plugin': null,
              'mini-css-extract-plugin': null,
              'postcss-loader': null,
              'sass-loader': null,
              'terser-webpack-plugin': null,
              'ts-loader': null,
              'vue-loader': null,
              'vue-style-loader': null,
              webpack: null,
              'webpack-bundle-analyzer': null,
              'webpack-cli': null,
              'webpack-dev-server': null,
              'webpack-merge': null,
              'workbox-webpack-plugin': null,
              ...(enableTranslation
                ? {
                    'folder-hash': null,
                    'merge-jsons-webpack-plugin': null,
                  }
                : {}),
            },
          });
        }
      },
      addIndexAsset({ source, application }) {
        if (!application.clientBundlerVite) return;
        source.addExternalResourceToRoot!({
          resource: '<script>const global = globalThis;</script>',
          comment: 'Workaround https://github.com/axios/axios/issues/5622',
        });
        source.addExternalResourceToRoot!({
          resource: `<script type="module" src="./app/${application.microfrontend ? 'index.ts' : 'main.ts'}"></script>`,
          comment: 'Load vue main',
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      postWriteEntityFiles,
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        this.log.ok('Vue application generated successfully.');
        this.log.log(
          chalk.green(`  Start your Webpack development server with:
  ${chalk.yellow.bold(`${application.nodePackageManager} start`)}
`),
        );
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  /**
   * @private
   * Add a new entity in the "entities" menu.
   *
   * @param {string} routerName - The name of the Angular router (which by default is the name of the entity).
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} clientFramework - The name of the client framework
   * @param {string} entityTranslationKeyMenu - i18n key for entity entry in menu
   * @param {string} entityTranslationValue - i18n value for entity entry in menu
   */
  addEntityToMenu(
    routerName,
    enableTranslation,
    entityTranslationKeyMenu = camelCase(routerName),
    entityTranslationValue = startCase(routerName),
  ) {
    this.needleApi.clientVue.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue);
  }

  /**
   * @private
   * Add a new entity in the TS modules file.
   *
   * @param {string} entityInstance - Entity Instance
   * @param {string} entityClass - Entity Class
   * @param {string} entityName - Entity Name
   * @param {string} entityFolderName - Entity Folder Name
   * @param {string} entityFileName - Entity File Name
   * @param {string} entityUrl - Entity router URL
   * @param {string} microserviceName - Microservice Name
   * @param {boolean} readOnly - If the entity is read-only or not
   * @param {string} pageTitle - The translation key or the text for the page title in the browser
   */
  addEntityToModule(entityInstance, entityClass, entityName, entityFolderName, entityFileName, _entityUrl, _microserviceName, readOnly?) {
    this.needleApi.clientVue.addEntityToRouterImport(entityName, entityFileName, entityFolderName, readOnly);
    this.needleApi.clientVue.addEntityToRouter(entityInstance, entityName, entityFileName, readOnly);
    this.needleApi.clientVue.addEntityServiceToEntitiesComponentImport(entityName, entityClass, entityFileName, entityFolderName);
    this.needleApi.clientVue.addEntityServiceToEntitiesComponent(entityInstance, entityName);
  }

  /**
   * @private
   * Generate Entity Client Field Default Values
   *
   * @param {Array|Object} fields - array of fields
   * @returns {Array} defaultVariablesValues
   */
  generateEntityClientFieldDefaultValues(fields) {
    const defaultVariablesValues = {};
    fields.forEach(field => {
      const fieldType = field.fieldType;
      const fieldName = field.fieldName;
      if (fieldType === TYPE_BOOLEAN) {
        defaultVariablesValues[fieldName] = `this.${fieldName} = this.${fieldName} ?? false;`;
      }
    });
    return defaultVariablesValues;
  }

  generateEntityClientFields(primaryKey, fields, relationships, dto, customDateType = 'dayjs.Dayjs', embedded = false) {
    return getHydratedEntityClientFields(primaryKey, fields, relationships, dto, customDateType, embedded, VUE);
  }

  generateEntityClientImports(relationships, dto) {
    return formatEntityClientImports(relationships, dto, VUE);
  }

  generateEntityClientEnumImports(fields) {
    return getClientEnumImportsFormat(fields, VUE);
  }
}
