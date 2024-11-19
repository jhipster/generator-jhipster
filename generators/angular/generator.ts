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
import chalk from 'chalk';
import { isFileStateModified } from 'mem-fs-editor/state';
import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_ANGULAR, GENERATOR_CLIENT, GENERATOR_LANGUAGES } from '../generator-list.js';
import { defaultLanguage } from '../languages/support/index.js';
import { clientFrameworkTypes } from '../../lib/jhipster/index.js';
import { generateEntityClientEnumImports as getClientEnumImportsFormat } from '../client/support/index.js';
import { createNeedleCallback, mutateData } from '../base/support/index.js';
import { writeEslintClientRootConfigFile } from '../javascript/generators/eslint/support/tasks.js';
import type { TaskTypes as DefaultTaskTypes } from '../../lib/types/application/tasks.js';
import { cleanupEntitiesFiles, postWriteEntitiesFiles, writeEntitiesFiles } from './entity-files-angular.js';
import { writeFiles } from './files-angular.js';
import cleanupOldFilesTask from './cleanup.js';
import type { addItemToMenu } from './support/index.js';
import {
  addEntitiesRoute,
  addIconImport,
  addItemToAdminMenu,
  addRoute,
  addToEntitiesMenu,
  isTranslatedAngularFile,
  translateAngularFilesTransform,
} from './support/index.js';
import type { AngularApplication, AngularEntity } from './types.js';

const { ANGULAR } = clientFrameworkTypes;

export default class AngularGenerator extends BaseApplicationGenerator<DefaultTaskTypes<AngularEntity, AngularApplication>> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_CLIENT);
      await this.dependsOnJHipster(GENERATOR_LANGUAGES);
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_ANGULAR, 'resources', 'package.json'),
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
      applicationDefauts({ application, applicationDefaults }) {
        applicationDefaults({
          __override__: true,
          eslintConfigFile: app => `eslint.config.${app.packageJsonType === 'module' ? 'js' : 'mjs'}`,
          webappEnumerationsDir: app => `${app.clientSrcDir}app/entities/enumerations/`,
          angularLocaleId: app => app.nativeLanguageDefinition.angularLocale ?? defaultLanguage.angularLocale!,
        });
        application.addPrettierExtensions?.(['html', 'css', 'scss']);
      },
      addNeedles({ source, application }) {
        source.addEntitiesToClient = param => {
          const routeTemplatePath = `${param.application.clientSrcDir}app/entities/entity.routes.ts`;
          const ignoreNonExistingRoute = chalk.yellow(`Route(s) not added to ${routeTemplatePath}.`);
          const addRouteCallback = addEntitiesRoute(param);
          this.editFile(routeTemplatePath, { ignoreNonExisting: ignoreNonExistingRoute }, addRouteCallback);

          const filePath = `${application.clientSrcDir}app/layouts/navbar/navbar.component.html`;
          const ignoreNonExisting = chalk.yellow('Reference to entities not added to menu.');
          const editCallback = addToEntitiesMenu(param);
          this.editFile(filePath, { ignoreNonExisting }, editCallback);
        };
        source.addAdminRoute = (args: Omit<Parameters<typeof addRoute>[0], 'needle'>) =>
          this.editFile(
            `${application.srcMainWebapp}app/admin/admin.routes.ts`,
            addRoute({
              needle: 'add-admin-route',
              ...args,
            }),
          );

        source.addItemToAdminMenu = (args: Omit<Parameters<typeof addItemToMenu>[0], 'needle' | 'enableTranslation' | 'jhiPrefix'>) => {
          this.editFile(
            `${application.srcMainWebapp}app/layouts/navbar/navbar.component.html`,
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
          const iconsPath = `${application.srcMainWebapp}app/config/font-awesome-icons.ts`;
          const ignoreNonExisting = this.sharedData.getControl().ignoreNeedlesError && 'Icon imports not updated with icon';
          this.editFile(iconsPath, { ignoreNonExisting }, addIconImport(args));
        };

        source.addWebpackConfig = args => {
          const webpackPath = `${application.clientRootDir}webpack/webpack.custom.js`;
          const ignoreNonExisting = this.sharedData.getControl().ignoreNeedlesError && 'Webpack configuration file not found';
          this.editFile(
            webpackPath,
            { ignoreNonExisting },
            createNeedleCallback({
              needle: 'jhipster-needle-add-webpack-config',
              contentToAdd: `${args.config},`,
            }),
          );
        };

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
        const asAuthorities = authorities => (authorities.length > 0 ? authorities.map(auth => `'${auth}'`).join(', ') : undefined);
        mutateData(entity, {
          entityAngularAuthorities: asAuthorities(entity.entityAuthority?.split(',') ?? []),
          entityAngularReadAuthorities: asAuthorities([
            ...(entity.entityAuthority?.split(',') ?? []),
            ...(entity.entityReadAuthority?.split(',') ?? []),
          ]),
        });
        entity.generateEntityClientEnumImports = fields => {
          return getClientEnumImportsFormat(fields, ANGULAR);
        };
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
        } as any);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get default() {
    return this.asDefaultTaskGroup({
      loadEntities({ application }) {
        const entities = this.sharedData.getEntities().map(({ entity }) => entity);
        application.angularEntities = entities.filter(entity => !entity.builtIn && !entity.skipClient) as AngularEntity[];
      },
      queueTranslateTransform({ control, application }) {
        const { enableTranslation, jhiPrefix } = application;
        this.queueTransformStream(
          {
            name: 'translating angular application',
            filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && isTranslatedAngularFile(file),
            refresh: false,
          },
          translateAngularFilesTransform(control.getWebappTranslation!, { enableTranslation, jhiPrefix }),
        );
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ control }) {
        await control.cleanupFiles({
          '8.6.1': ['.eslintrc.json', '.eslintignore'],
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
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addWebsocketDependencies({ application, source }) {
        const { authenticationTypeSession, communicationSpringWebsocket, nodeDependencies } = application;
        const dependencies = {};
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
