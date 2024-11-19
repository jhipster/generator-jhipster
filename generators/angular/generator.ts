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
import { camelCase } from 'lodash-es';
import chalk from 'chalk';
import { isFileStateModified } from 'mem-fs-editor/state';

import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_ANGULAR, GENERATOR_CLIENT, GENERATOR_LANGUAGES } from '../generator-list.js';
import { defaultLanguage } from '../languages/support/index.js';
import { clientFrameworkTypes } from '../../lib/jhipster/index.js';
import { generateEntityClientEnumImports as getClientEnumImportsFormat } from '../client/support/index.js';
import { createNeedleCallback, mutateData } from '../base/support/index.js';
import { writeEslintClientRootConfigFile } from '../javascript/generators/eslint/support/tasks.js';
import type { PostWritingEntitiesTaskParam } from '../../lib/types/application/tasks.js';
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

const { ANGULAR } = clientFrameworkTypes;

export default class AngularGenerator extends BaseApplicationGenerator {
  localEntities?: any[];

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
          this.addEntitiesToModule(param);
          this.addEntitiesToMenu(param);
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
      loadEntities() {
        const entities = this.sharedData.getEntities().map(({ entity }) => entity);
        this.localEntities = entities.filter(entity => !entity.builtIn && !entity.skipClient);
      },
      queueTranslateTransform({ control, application }) {
        const { enableTranslation, jhiPrefix } = application;
        this.queueTransformStream(
          {
            name: 'translating angular application',
            filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && isTranslatedAngularFile(file),
            refresh: false,
          },
          translateAngularFilesTransform(control.getWebappTranslation, { enableTranslation, jhiPrefix }),
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

  /**
   * @private
   * Add new scss style to the angular application in "vendor.scss".
   *
   * @param {string} style - scss to add in the file
   * @param {string} comment - comment to add before css code
   *
   * example:
   *
   * style = '.success {\n     @extend .message;\n    border-color: green;\n}'
   * comment = 'Message'
   *
   * * ==========================================================================
   * Message
   * ========================================================================== *
   * .success {
   *     @extend .message;
   *     border-color: green;
   * }
   *
   */
  addVendorSCSSStyle(style, comment?) {
    this.needleApi.clientAngular.addVendorSCSSStyle(style, comment);
  }

  /**
   * @private
   * Add a new lazy loaded module to admin routing file.
   *
   * @param {string} route - The route for the module. For example 'entity-audit'.
   * @param {string} modulePath - The path to the module file. For example './entity-audit/entity-audit.module'.
   * @param {string} moduleName - The name of the module. For example 'EntityAuditModule'.
   * @param {string} pageTitle - The translation key if i18n is enabled or the text if i18n is disabled for the page title in the browser.
   *                             For example 'entityAudit.home.title' for i18n enabled or 'Entity audit' for i18n disabled.
   *                             If undefined then application global page title is used in the browser title bar.
   */
  addAdminRoute(route, modulePath, moduleName, pageTitle) {
    this.needleApi.clientAngular.addAdminRoute(route, modulePath, moduleName, pageTitle);
  }

  /**
   * @private
   * Add a new module in the TS modules file.
   *
   * @param {string} appName - Angular2 application name.
   * @param {string} angularName - The name of the new admin item.
   * @param {string} folderName - The name of the folder.
   * @param {string} fileName - The name of the file.
   * @param {boolean} enableTranslation - If translations are enabled or not.
   * @param {string} clientFramework - The name of the client framework.
   */
  addAngularModule(appName, angularName, folderName, fileName, enableTranslation) {
    this.needleApi.clientAngular.addModule(appName, angularName, folderName, fileName, enableTranslation);
  }

  /**
   * @private
   * Add a new icon to icon imports.
   *
   * @param {string} iconName - The name of the Font Awesome icon.
   */
  addIcon(iconName) {
    this.needleApi.clientAngular.addIcon(iconName);
  }

  /**
   * Add a new menu element to the admin menu.
   *
   * @param {string} routerName - The name of the Angular router that is added to the admin menu.
   * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} translationKeyMenu - i18n key for entry in the admin menu
   */
  addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu = camelCase(routerName), jhiPrefix?) {
    this.needleApi.clientAngular.addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu, jhiPrefix);
  }

  addEntitiesToMenu({ application, entities }: Pick<PostWritingEntitiesTaskParam, 'application' | 'entities'>) {
    const filePath = `${application.clientSrcDir}app/layouts/navbar/navbar.component.html`;
    const ignoreNonExisting = chalk.yellow('Reference to entities not added to menu.');
    const editCallback = addToEntitiesMenu({ application, entities });

    this.editFile(filePath, { ignoreNonExisting }, editCallback);
  }

  addEntitiesToModule(param: Pick<PostWritingEntitiesTaskParam, 'application' | 'entities'>) {
    const filePath = `${param.application.clientSrcDir}app/entities/entity.routes.ts`;
    const ignoreNonExisting = chalk.yellow(`Route(s) not added to ${filePath}.`);
    const addRouteCallback = addEntitiesRoute(param);
    this.editFile(filePath, { ignoreNonExisting }, addRouteCallback);
  }

  /**
   * @private
   * Add new scss style to the angular application in "global.scss
   *
   * @param {string} style - css to add in the file
   * @param {string} comment - comment to add before css code
   *
   * example:
   *
   * style = '.jhipster {\n     color: #baa186;\n}'
   * comment = 'New JHipster color'
   *
   * * ==========================================================================
   * New JHipster color
   * ========================================================================== *
   * .jhipster {
   *     color: #baa186;
   * }
   *
   */
  addMainSCSSStyle(style, comment?) {
    this.needleApi.clientAngular.addGlobalSCSSStyle(style, comment);
  }

  /**
   * Returns the typescript import section of enums referenced by all fields of the entity.
   * @param fields returns the import of enums that are referenced by the fields
   * @returns {typeImports:Map} the fields that potentially contains some enum types
   */
  generateEntityClientEnumImports(fields) {
    return getClientEnumImportsFormat(fields, ANGULAR);
  }

  /**
   * @private
   * Add a new menu element, at the root of the menu.
   *
   * @param {string} routerName - The name of the router that is added to the menu.
   * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} clientFramework - The name of the client framework
   * @param {string} translationKeyMenu - i18n key for entry in the menu
   */
  addElementToMenu(routerName, iconName, enableTranslation, _clientFramework?, translationKeyMenu = camelCase(routerName)) {
    this.needleApi.clientAngular.addElementToMenu(routerName, iconName, enableTranslation, translationKeyMenu);
  }
}
