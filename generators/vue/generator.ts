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

import { clientFrameworkTypes, fieldTypes } from '../../lib/jhipster/index.ts';
import type { Field } from '../base-application/types.ts';
import { createNeedleCallback } from '../base-core/support/index.ts';
import { ClientApplicationGenerator } from '../client/generator.ts';
import {
  generateEntityClientEnumImports as getClientEnumImportsFormat,
  generateEntityClientFields as getHydratedEntityClientFields,
  generateEntityClientImports as formatEntityClientImports,
} from '../client/support/index.ts';
import type { Field as ClientField } from '../client/types.ts';
import { writeEslintClientRootConfigFile } from '../javascript-simple-application/generators/eslint/support/tasks.ts';

import cleanupOldFilesTask from './cleanup.ts';
import { cleanupEntitiesFiles, postWriteEntityFiles, writeEntityFiles } from './entity-files-vue.ts';
import { writeEntitiesFiles, writeFiles } from './files-vue.ts';
import { convertTranslationsSupport, isTranslatedVueFile, translateVueFilesTransform } from './support/index.ts';

const { CommonDBTypes } = fieldTypes;
const { VUE } = clientFrameworkTypes;
const TYPE_BOOLEAN = CommonDBTypes.BOOLEAN;

export default class VueGenerator extends ClientApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('vue');
    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:client:i18n');
      await this.dependsOnJHipster('client');
      await this.dependsOnJHipster('languages');
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
          this.fetchFromInstalledJHipster('vue', 'resources', 'package.json'),
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
          webappEnumerationsDir: app => `${app.clientSrcDir}app/shared/model/enumerations/`,
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
        application.prettierExtensions.push('html', 'vue', 'css', 'scss');

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
              entityNameHumanized,
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
  <span>${enableTranslation ? `{{ $t('global.menu.entities.${entityTranslationKeyMenu}') }}` : entityNameHumanized}</span>
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
        const { clientI18nDir, enableTranslation, getWebappTranslation } = application;

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
          const { transform, isTranslationFile } = convertTranslationsSupport({ clientI18nDir });
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
        const { clientBundlerVite, clientBundlerWebpack, nodePackageManager } = application;
        if (clientBundlerVite) {
          source.mergeClientPackageJson!({
            scripts: {
              'webapp:build:dev': `${nodePackageManager} run vite-build`,
              'webapp:build:prod': `${nodePackageManager} run vite-build`,
              'webapp:dev': `${nodePackageManager} run vite-serve`,
              'webapp:serve': `${nodePackageManager} run vite-serve`,
              'vite-serve': 'vite',
              'vite-build': 'vite build',
            },
          });
        } else if (clientBundlerWebpack) {
          source.mergeClientPackageJson!({
            scripts: {
              'webapp:build:dev': `${nodePackageManager} run webpack -- --mode development --env stats=minimal`,
              'webapp:build:prod': `${nodePackageManager} run webpack -- --mode production --env stats=minimal`,
              'webapp:dev': `${nodePackageManager} run webpack-dev-server -- --mode development --env stats=normal`,
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
      sonar({ application, source }) {
        const { clientI18nDir, clientDistDir, clientSrcDir, temporaryDir } = application;
        source.addSonarProperties?.([
          { key: 'sonar.test.inclusions', value: `${clientSrcDir}app/**/*.spec.ts`, valueSep: ', ' },
          { key: 'sonar.testExecutionReportPaths', value: `${temporaryDir}/test-results/jest/TESTS-results-sonar.xml` },
          { key: 'sonar.javascript.lcov.reportPaths', value: `${temporaryDir}/test-results/lcov.info` },
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
   */
  generateEntityClientFieldDefaultValues(fields: ClientField[]): Record<string, string> {
    const defaultVariablesValues: Record<string, string> = {};
    fields.forEach(field => {
      const { fieldType, fieldName } = field;
      if (fieldType === TYPE_BOOLEAN) {
        defaultVariablesValues[fieldName] = `this.${fieldName} = this.${fieldName} ?? false;`;
      }
    });
    return defaultVariablesValues;
  }

  generateEntityClientFields(
    primaryKey: Parameters<typeof getHydratedEntityClientFields>[0],
    fields: Parameters<typeof getHydratedEntityClientFields>[1],
    relationships: Parameters<typeof getHydratedEntityClientFields>[2],
    dto: Parameters<typeof getHydratedEntityClientFields>[3],
    customDateType: Parameters<typeof getHydratedEntityClientFields>[4] = 'dayjs.Dayjs',
    embedded: Parameters<typeof getHydratedEntityClientFields>[5] = false,
  ) {
    return getHydratedEntityClientFields(primaryKey, fields, relationships, dto, customDateType, embedded, VUE);
  }

  generateEntityClientImports(
    relationships: Parameters<typeof formatEntityClientImports>[0],
    dto: Parameters<typeof formatEntityClientImports>[1],
  ) {
    return formatEntityClientImports(relationships, dto, VUE);
  }

  generateEntityClientEnumImports(fields: Field[]): Map<string, string> {
    return getClientEnumImportsFormat(fields, VUE);
  }
}
