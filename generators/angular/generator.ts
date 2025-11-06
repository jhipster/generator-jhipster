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

import { clientFrameworkTypes } from '../../lib/jhipster/index.ts';
import { mutateData } from '../../lib/utils/index.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import { createNeedleCallback } from '../base-core/support/index.ts';
import { generateEntityClientEnumImports as getClientEnumImportsFormat } from '../client/support/index.ts';
import { JAVA_WEBAPP_SOURCES_DIR } from '../index.ts';
import { writeEslintClientRootConfigFile } from '../javascript-simple-application/generators/eslint/support/tasks.ts';
import { defaultLanguage } from '../languages/support/index.ts';

import cleanupOldFilesTask from './cleanup.ts';
import { cleanupEntitiesFiles, postWriteEntitiesFiles, writeEntitiesFiles } from './entity-files-angular.ts';
import { writeFiles } from './files-angular.ts';
import type { addItemToMenu } from './support/index.ts';
import {
  addEntitiesRoute,
  addIconImport,
  addItemToAdminMenu,
  addRoute,
  addToEntitiesMenu,
  isTranslatedAngularFile,
  translateAngularFilesTransform,
} from './support/index.ts';
import type {
  Application as AngularApplication,
  Config as AngularConfig,
  Entity as AngularEntity,
  Options as AngularOptions,
  Source as AngularSource,
} from './types.ts';

const { ANGULAR } = clientFrameworkTypes;

export class AngularApplicationGenerator extends BaseApplicationGenerator<
  AngularEntity,
  AngularApplication<AngularEntity>,
  AngularConfig,
  AngularOptions,
  AngularSource
> {}

export default class AngularGenerator extends AngularApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('angular');
    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:client:i18n');
      await this.dependsOnJHipster('client');
      await this.dependsOnJHipster('languages');
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      migrateWebpackAndEsbuild({ control }) {
        if (control.isJhipsterVersionLessThan('9.0.0-alpha.0')) {
          this.jhipsterConfig.clientBundler ??= 'webpack';
        }
        // @ts-expect-error renamed option
        if (this.jhipsterConfig.clientBundler === 'experimentalEsbuild') {
          this.jhipsterConfig.clientBundler = 'esbuild';
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
          this.fetchFromInstalledJHipster('angular', 'resources', 'package.json'),
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

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      applicationDefaults({ application, applicationDefaults }) {
        applicationDefaults({
          __override__: true,
          eslintConfigFile: app => `eslint.config.${app.packageJsonType === 'module' ? 'js' : 'mjs'}`,
          webappEnumerationsDir: app => `${app.clientSrcDir}app/entities/enumerations/`,
          angularLocaleId: app => app.nativeLanguageDefinition.angularLocale ?? defaultLanguage.angularLocale!,
        });
        application.prettierExtensions.push('html', 'css', 'scss');
        application.prettierFolders.push(application.clientBundlerWebpack ? 'webpack/**/' : 'build-plugins/**/');
        if (!application.backendTypeJavaAny && application.clientSrcDir !== JAVA_WEBAPP_SOURCES_DIR) {
          // When we have a java backend, 'src/**' is already added by java:bootstrap
          application.prettierFolders.push(`${application.clientSrcDir}**/`);
        }
      },
      async javaNodeBuildPaths({ application }) {
        application.javaNodeBuildPaths?.push('angular.json', 'tsconfig.json', 'tsconfig.app.json');
        if (application.clientBundlerWebpack) {
          application.javaNodeBuildPaths?.push('webpack/');
        } else if (application.clientBundlerEsbuild) {
          application.javaNodeBuildPaths?.push('build-plugins/');
          if (application.enableI18nRTL) {
            application.javaNodeBuildPaths?.push('postcss.conf.json');
          }
        }
      },
      addNeedles({ source, application }) {
        source.addEntitiesToClient = param => {
          const routeTemplatePath = `${param.application.clientSrcDir}app/entities/entity.routes.ts`;
          const ignoreNonExistingRoute = chalk.yellow(`Route(s) not added to ${routeTemplatePath}.`);
          const addRouteCallback = addEntitiesRoute(param);
          this.editFile(routeTemplatePath, { ignoreNonExisting: ignoreNonExistingRoute }, addRouteCallback);

          const filePath = `${application.clientSrcDir}app/layouts/navbar/navbar.html`;
          const ignoreNonExisting = chalk.yellow('Reference to entities not added to menu.');
          const editCallback = addToEntitiesMenu(param);
          this.editFile(filePath, { ignoreNonExisting }, editCallback);
        };
        source.addAdminRoute = (args: Omit<Parameters<typeof addRoute>[0], 'needle'>) =>
          this.editFile(
            `${application.clientSrcDir}app/admin/admin.routes.ts`,
            addRoute({
              needle: 'add-admin-route',
              ...args,
            }),
          );

        source.addItemToAdminMenu = (args: Omit<Parameters<typeof addItemToMenu>[0], 'needle' | 'enableTranslation' | 'jhiPrefix'>) => {
          this.editFile(
            `${application.clientSrcDir}app/layouts/navbar/navbar.html`,
            addItemToAdminMenu({
              enableTranslation: application.enableTranslation,
              jhiPrefix: application.jhiPrefix,
              ...args,
            }),
          );
          if (args.icon) {
            source.addIconImport!({ icon: args.icon });
          }
        };

        source.addIconImport = args => {
          const iconsPath = `${application.clientSrcDir}app/config/font-awesome-icons.ts`;
          const ignoreNonExisting = this.ignoreNeedlesError && 'Icon imports not updated with icon';
          this.editFile(iconsPath, { ignoreNonExisting }, addIconImport(args));
        };

        if (application.clientBundlerWebpack) {
          source.addWebpackConfig = args => {
            const webpackPath = `${application.clientRootDir}webpack/webpack.custom.js`;
            const ignoreNonExisting = this.ignoreNeedlesError && 'Webpack configuration file not found';
            this.editFile(
              webpackPath,
              { ignoreNonExisting },
              createNeedleCallback({
                needle: 'jhipster-needle-add-webpack-config',
                contentToAdd: `${args.config},`,
              }),
            );
          };
        }

        if (application.clientRootDir) {
          // Overrides only works if added in root package.json
          this.packageJson.merge({
            overrides: {
              'browser-sync': application.nodeDependencies['browser-sync'],
              webpack: application.nodeDependencies.webpack,
            },
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        const asAuthorities = (authorities: string[]): string | undefined =>
          authorities.length > 0 ? authorities.map(auth => `'${auth}'`).join(', ') : undefined;
        mutateData(entity, {
          entityAngularAuthorities: asAuthorities(entity.entityAuthority?.split(',') ?? []),
          entityAngularReadAuthorities: asAuthorities([
            ...(entity.entityAuthority?.split(',') ?? []),
            ...(entity.entityReadAuthority?.split(',') ?? []),
          ]),
        });
        entity.generateEntityClientEnumImports = (fields: any) => getClientEnumImportsFormat(fields, ANGULAR);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareField({ field }) {
        mutateData(field, {
          fieldTsDefaultValue: ({ fieldTsDefaultValue, defaultValue, fieldTypeCharSequence, fieldTypeTimed }) => {
            let returnValue: string | undefined;
            if (fieldTsDefaultValue !== undefined || defaultValue !== undefined) {
              let fieldDefaultValue;
              if (fieldTsDefaultValue !== undefined) {
                fieldDefaultValue = fieldTsDefaultValue;
              } else {
                fieldDefaultValue = defaultValue;
              }

              fieldDefaultValue = String(fieldDefaultValue).replace(/'/g, "\\'");

              if (fieldTypeCharSequence) {
                returnValue = `'${fieldDefaultValue}'`;
              } else if (fieldTypeTimed) {
                returnValue = `dayjs('${fieldDefaultValue}')`;
              } else {
                returnValue = fieldDefaultValue;
              }
            }
            return returnValue;
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get default() {
    return this.asDefaultTaskGroup({
      loadEntities({ application, entities }) {
        application.angularEntities = entities.filter(entity => !entity.builtIn && !entity.skipClient) as AngularEntity[];
      },
      queueTranslateTransform({ application }) {
        const { enableTranslation, jhiPrefix } = application;
        this.queueTransformStream(
          {
            name: 'translating angular application',
            filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && isTranslatedAngularFile(file),
            refresh: false,
          },
          translateAngularFilesTransform(application.getWebappTranslation!, { enableTranslation, jhiPrefix }),
        );
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ application, control }) {
        await control.cleanupFiles({
          '8.6.1': ['.eslintrc.json', '.eslintignore'],
          '8.7.4': [`${application.clientSrcDir}app/app.constants.ts`],
          '9.0.0-alpha.0': [[application.clientTestFrameworkJest!, `${application.clientRootDir}jest.conf.js`]],
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
      async cleanup({ control, application }) {
        await control.cleanupFiles({
          '9.0.0-alpha.0': [
            [
              application.clientBundlerEsbuild!,
              `${application.clientRootDir}build-plugins/define-esbuild.mjs`,
              `${application.clientRootDir}build-plugins/i18n-esbuild.mjs`,
            ],
            [
              !application.microfrontend || !application.applicationTypeMicroservice,
              `${application.clientSrcDir}app/entities/entity-navbar-items.ts`,
            ],
          ],
        });
      },
      cleanupEntitiesFiles,
      writeEntitiesFiles,
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      clientBundler({ application, source }) {
        const { clientBundlerEsbuild, enableTranslation, nodeDependencies } = application;
        if (clientBundlerEsbuild) {
          source.mergeClientPackageJson!({
            devDependencies: {
              '@angular-builders/custom-esbuild': null,
              '@angular/build': null,
              tinyglobby: null,
              ...(enableTranslation ? { '@types/folder-hash': null, 'folder-hash': null, deepmerge: null } : {}),
            },
          });
        } else {
          source.mergeClientPackageJson!({
            dependencies: enableTranslation
              ? {
                  '@ngx-translate/http-loader': null,
                }
              : {},
            devDependencies: {
              '@angular-builders/custom-webpack': null,
              'browser-sync-webpack-plugin': null,
              'copy-webpack-plugin': null,
              'webpack-bundle-analyzer': null,
              'webpack-merge': null,
              'webpack-notifier': null,
              ...(enableTranslation ? { 'folder-hash': null, 'merge-jsons-webpack-plugin': null } : {}),
            },
            overrides: {
              'browser-sync': nodeDependencies['browser-sync'],
              webpack: nodeDependencies.webpack,
            },
          });
        }
      },
      addWebsocketDependencies({ application, source }) {
        const { authenticationTypeSession, communicationSpringWebsocket, nodeDependencies } = application;
        const dependencies: Record<string, string> = {};
        if (communicationSpringWebsocket) {
          if (authenticationTypeSession) {
            dependencies['ngx-cookie-service'] = nodeDependencies['ngx-cookie-service'];
          }
          source.mergeClientPackageJson!({
            dependencies: {
              'sockjs-client': nodeDependencies['sockjs-client'],
              '@stomp/rx-stomp': nodeDependencies['@stomp/rx-stomp'],
              ...dependencies,
            },
            devDependencies: {
              '@types/sockjs-client': nodeDependencies['@types/sockjs-client'],
            },
          });
        }
      },
      sonar({ application, source }) {
        const { clientDistDir, clientSrcDir, clientI18nDir, temporaryDir } = application;
        source.addSonarProperties?.([
          { key: 'sonar.test.inclusions', value: `${clientSrcDir}app/**/*.spec.ts`, valueSep: ', ' },
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

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      postWriteEntitiesFiles,
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        this.log.ok('Angular application generated successfully.');
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
}
