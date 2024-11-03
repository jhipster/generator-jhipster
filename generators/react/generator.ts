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
import { isFileStateModified } from 'mem-fs-editor/state';
import chalk from 'chalk';
import { camelCase, startCase } from 'lodash-es';

import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_CLIENT, GENERATOR_LANGUAGES, GENERATOR_REACT } from '../generator-list.js';
import { clientFrameworkTypes, fieldTypes } from '../../lib/jhipster/index.js';
import {
  generateEntityClientImports as formatEntityClientImports,
  generateEntityClientEnumImports as getClientEnumImportsFormat,
  generateEntityClientFields as getHydratedEntityClientFields,
  generateTestEntityId as getTestEntityId,
  generateTestEntityPrimaryKey as getTestEntityPrimaryKey,
} from '../client/support/index.js';
import { createNeedleCallback, upperFirstCamelCase } from '../base/support/index.js';
import { writeEslintClientRootConfigFile } from '../javascript/generators/eslint/support/tasks.js';
import { cleanupEntitiesFiles, postWriteEntitiesFiles, writeEntitiesFiles } from './entity-files-react.js';
import cleanupOldFilesTask from './cleanup.js';
import { writeFiles } from './files-react.js';
import { prepareEntity } from './application/entities/index.js';
import { isTranslatedReactFile, translateReactFilesTransform } from './support/index.js';

const { CommonDBTypes } = fieldTypes;
const TYPE_BOOLEAN = CommonDBTypes.BOOLEAN;
const { REACT } = clientFrameworkTypes;

export default class ReactGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:javascript:bootstrap');
      await this.dependsOnJHipster(GENERATOR_CLIENT);
      await this.dependsOnJHipster(GENERATOR_LANGUAGES);
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        await this.composeWithJHipster('jhipster:client:common');
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_REACT, 'resources', 'package.json'),
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
        application.addPrettierExtensions?.(['html', 'tsx', 'css', 'scss']);

        applicationDefaults({
          __override__: true,
          eslintConfigFile: app => `eslint.config.${app.packageJsonType === 'module' ? 'js' : 'mjs'}`,
          webappEnumerationsDir: app => `${app.clientSrcDir}app/shared/model/enumerations/`,
        });
      },
      prepareForTemplates({ application, source }) {
        source.addWebpackConfig = args => {
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

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      react({ application, entity }) {
        prepareEntity({ entity, application });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get default() {
    return this.asDefaultTaskGroup({
      queueTranslateTransform({ control, application }) {
        if (!application.enableTranslation) {
          this.queueTransformStream(
            {
              name: 'translating react application',
              filter: file => isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && isTranslatedReactFile(file),
              refresh: false,
            },
            translateReactFilesTransform(control.getWebappTranslation!),
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
              Boolean(application.microfrontend && application.applicationTypeGateway),
              `${application.srcMainWebapp}microfrontends/entities-menu.tsx`,
              `${application.srcMainWebapp}microfrontends/entities-routes.tsx`,
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
    return {
      cleanupEntitiesFiles,
      writeEntitiesFiles,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWritingEntities() {
    return {
      postWriteEntitiesFiles,
    };
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
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
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
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

  get [BaseApplicationGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  /**
   * @private
   * Add a new entity in the "entities" menu.
   *
   * @param {string} routerName - The name of the Angular router (which by default is the name of the entity).
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} entityTranslationKeyMenu - i18n key for entity entry in menu
   * @param {string} entityTranslationValue - i18n value for entity entry in menu
   */
  addEntityToMenu(
    routerName,
    enableTranslation,
    entityTranslationKeyMenu = camelCase(routerName),
    entityTranslationValue = startCase(routerName),
  ) {
    this.needleApi.clientReact.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue);
  }

  /**
   * @experimental
   * Add a new entity in the TS modules file.
   *
   * @param {string} entityInstance - Entity Instance
   * @param {string} entityClass - Entity Class
   * @param {string} entityName - Entity Name
   * @param {string} entityFolderName - Entity Folder Name
   * @param {string} entityFileName - Entity File Name
   * @param {string} entityUrl - Entity router URL
   * @param {string} clientFramework - The name of the client framework
   * @param {string} microserviceName - Microservice Name
   * @param {boolean} readOnly - If the entity is read-only or not
   * @param {string} pageTitle - The translation key or the text for the page title in the browser
   */
  addEntityToModule(
    entityInstance,
    entityClass,
    entityName,
    entityFolderName,
    entityFileName,
    { applicationTypeMicroservice, clientSrcDir },
  ) {
    this.needleApi.clientReact.addEntityToModule(entityInstance, entityClass, entityName, entityFolderName, entityFileName, {
      applicationTypeMicroservice,
      clientSrcDir,
    });
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
        defaultVariablesValues[fieldName] = `${fieldName}: false,`;
      }
    });
    return defaultVariablesValues;
  }

  generateEntityClientFields(primaryKey, fields, relationships, dto, customDateType = 'dayjs.Dayjs', embedded = false) {
    return getHydratedEntityClientFields(primaryKey, fields, relationships, dto, customDateType, embedded, REACT);
  }

  generateEntityClientImports(relationships, dto) {
    return formatEntityClientImports(relationships, dto, REACT);
  }

  generateEntityClientEnumImports(fields) {
    return getClientEnumImportsFormat(fields, REACT);
  }

  generateTestEntityId(primaryKey, index = 0, wrapped = true) {
    return getTestEntityId(primaryKey, index, wrapped);
  }

  generateTestEntityPrimaryKey(primaryKey, index) {
    return getTestEntityPrimaryKey(primaryKey, index);
  }

  /**
   * @private
   * Add new scss style to the react application in "app.scss".
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
  addAppSCSSStyle(style, comment?) {
    this.needleApi.clientReact.addAppSCSSStyle(style, comment);
  }

  /**
   * get the an upperFirst camelCase value.
   * @param {string} value string to convert
   */
  upperFirstCamelCase(value) {
    return upperFirstCamelCase(value);
  }
}
