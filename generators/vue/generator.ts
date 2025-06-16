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
import assert from 'node:assert';
import chalk from 'chalk';
import { isFileStateModified } from 'mem-fs-editor/state';

import { ClientApplicationGenerator } from '../client/generator.ts';
import { clientFrameworkTypes, fieldTypes } from '../../lib/jhipster/index.js';
import { GENERATOR_CLIENT, GENERATOR_LANGUAGES, GENERATOR_VUE } from '../generator-list.js';
import {
  generateEntityClientImports as formatEntityClientImports,
  generateEntityClientEnumImports as getClientEnumImportsFormat,
  generateEntityClientFields as getHydratedEntityClientFields,
} from '../client/support/index.js';
import { createNeedleCallback } from '../base-core/support/index.ts';
import { writeEslintClientRootConfigFile } from '../javascript/generators/eslint/support/tasks.js';
import { cleanupEntitiesFiles, postWriteEntityFiles, writeEntityFiles } from './entity-files-vue.js';
import cleanupOldFilesTask from './cleanup.js';
import { writeEntitiesFiles, writeFiles } from './files-vue.js';
import { convertTranslationsSupport, isTranslatedVueFile, translateVueFilesTransform } from './support/index.js';

const { CommonDBTypes } = fieldTypes;
const { VUE } = clientFrameworkTypes;
const TYPE_BOOLEAN = CommonDBTypes.BOOLEAN;

export default class VueGenerator extends ClientApplicationGenerator {
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
      configureDevServerPort({ control }) {
        if (this.jhipsterConfig.devServerPort === undefined) return;
        if (control.isJhipsterVersionLessThan('8.7.4')) {
          // Migrate old devServerPort with new one
          const { applicationIndex = 0 } = this.jhipsterConfigWithDefaults;
          this.jhipsterConfig.devServerPort = 9000 + applicationIndex;
        }
      },
    });
  }

  get [ClientApplicationGenerator.CONFIGURING]() {
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

  get [ClientApplicationGenerator.LOADING]() {
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

        source.addEntitiesToClient = ({ application, entities }) => {
          const { enableTranslation } = application;
          for (const entity of entities) {
            const {
              entityInstance,
              entityFolderName,
              entityFileName,
              entityClassHumanized,
              entityPage,
              entityTranslationKeyMenu,
              entityAngularName,
              readOnly,
            } = entity;

            this.editFile(
              `${application.clientSrcDir}/app/router/entities.ts`,
              createNeedleCallback({
                needle: 'jhipster-needle-add-entity-to-router-import',
                contentToAdd: `const ${entityAngularName} = () => import('@/entities/${entityFolderName}/${entityFileName}.vue');
const ${entityAngularName}Details = () => import('@/entities/${entityFolderName}/${entityFileName}-details.vue');${
                  readOnly
                    ? ''
                    : `
const ${entityAngularName}Update = () => import('@/entities/${entityFolderName}/${entityFileName}-update.vue');`
                }`,
                contentToCheck: `import('@/entities/${entityFolderName}/${entityFileName}.vue');`,
              }),
            );

            this.editFile(
              `${application.clientSrcDir}/app/router/entities.ts`,
              createNeedleCallback({
                needle: 'jhipster-needle-add-entity-to-router',
                contentToAdd: `{
  path: '${entityPage}',
  name: '${entityAngularName}',
  component: ${entityAngularName},
  meta: { authorities: [Authority.USER] }
},
{
  path: '${entityPage}/:${entityInstance}Id/view',
  name: '${entityAngularName}View',
  component: ${entityAngularName}Details,
  meta: { authorities: [Authority.USER] }
},${
                  readOnly
                    ? ''
                    : `
{
  path: '${entityPage}/new',
  name: '${entityAngularName}Create',
  component: ${entityAngularName}Update,
  meta: { authorities: [Authority.USER] }
},
{
  path: '${entityPage}/:${entityInstance}Id/edit',
  name: '${entityAngularName}Edit',
  component: ${entityAngularName}Update,
  meta: { authorities: [Authority.USER] }
},`
                }`,
                contentToCheck: `path: '${entityFileName}'`,
              }),
            );

            this.editFile(
              `${application.clientSrcDir}/app/entities/entities.component.ts`,
              createNeedleCallback({
                needle: 'jhipster-needle-add-entity-service-to-entities-component-import',
                contentToAdd: `import ${entityAngularName}Service from './${entityFolderName}/${entityFileName}.service';`,
              }),
              createNeedleCallback({
                needle: 'add-entity-service-to-entities-component',
                contentToAdd: `provide('${entityInstance}Service', () => new ${entityAngularName}Service());`,
              }),
            );

            this.editFile(
              `${application.clientSrcDir}/app/entities/entities-menu.vue`,
              createNeedleCallback({
                needle: 'add-entity-to-menu',
                contentToAdd: `<b-dropdown-item to="/${entityPage}">
  <font-awesome-icon icon="asterisk" />
  <span${enableTranslation ? ` v-text="$t('global.menu.entities.${entityTranslationKeyMenu}')"` : ''}>${entityClassHumanized}</span>
</b-dropdown-item>`,
                contentToCheck: `<b-dropdown-item to="/${entityPage}">`,
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

  get default() {
    return this.asDefaultTaskGroup({
      async queueTranslateTransform({ application }) {
        const { enableTranslation, clientSrcDir, getWebappTranslation } = application;

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

  get [ClientApplicationGenerator.DEFAULT]() {
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

  get [ClientApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      cleanupEntitiesFiles,
      writeEntitiesFiles,
      writeEntityFiles,
    });
  }

  get [ClientApplicationGenerator.WRITING_ENTITIES]() {
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

  get [ClientApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      postWriteEntityFiles,
    });
  }

  get [ClientApplicationGenerator.POST_WRITING_ENTITIES]() {
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

  get [ClientApplicationGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
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
